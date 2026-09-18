import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, MagicMock
from sqlalchemy import select

from app.models.user import User


@pytest.mark.asyncio
async def test_registration_creates_verification_code(client, db_session):
    with patch("resend.Emails.send", return_value={"id": "mock_email_id"}) as mock_send:
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "ana@example.com",
                "password": "Password123!",
                "full_name": "Ana Rodriguez",
                "phone": "+524779876543",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "ana@example.com"
        assert data["is_verified"] is False
        assert data["email_verified_at"] is None

        # Check DB to verify code was assigned
        result = await db_session.execute(select(User).where(User.email == "ana@example.com"))
        user = result.scalars().first()
        assert user is not None
        assert user.verification_code is not None
        assert len(user.verification_code) == 6
        assert user.verification_code.isdigit()
        assert user.verification_code_expires_at is not None


@pytest.mark.asyncio
async def test_verify_code_success_authenticated(client, db_session):
    # 1. Register
    reg = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "bernardo@example.com",
            "password": "Password123!",
            "full_name": "Bernardo Silva",
        },
    )
    assert reg.status_code == 201

    # Get OTP code from DB
    result = await db_session.execute(select(User).where(User.email == "bernardo@example.com"))
    user = result.scalars().first()
    code = user.verification_code

    # 2. Login to get token
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "bernardo@example.com", "password": "Password123!"},
    )
    token = login.json()["access_token"]

    # 3. Verify code
    verify_res = await client.post(
        "/api/v1/auth/verify-code",
        headers={"Authorization": f"Bearer {token}"},
        json={"code": code},
    )
    assert verify_res.status_code == 200
    verified_data = verify_res.json()
    assert verified_data["is_verified"] is True
    assert verified_data["email_verified_at"] is not None

    # Check DB
    await db_session.refresh(user)
    assert user.is_verified is True
    assert user.verification_code is None
    assert user.verification_code_expires_at is None


@pytest.mark.asyncio
async def test_verify_code_success_unauthenticated_with_email(client, db_session):
    # 1. Register
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "clara@example.com",
            "password": "Password123!",
            "full_name": "Clara Ruiz",
        },
    )
    result = await db_session.execute(select(User).where(User.email == "clara@example.com"))
    user = result.scalars().first()
    code = user.verification_code

    # 2. Verify with email in payload without Authorization header
    verify_res = await client.post(
        "/api/v1/auth/verify-code",
        json={"email": "clara@example.com", "code": code},
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["is_verified"] is True


@pytest.mark.asyncio
async def test_verify_code_invalid(client, db_session):
    # 1. Register
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "diego@example.com",
            "password": "Password123!",
            "full_name": "Diego Ramos",
        },
    )
    # 2. Try wrong code
    verify_res = await client.post(
        "/api/v1/auth/verify-code",
        json={"email": "diego@example.com", "code": "000000"},
    )
    assert verify_res.status_code == 400
    assert "incorrecto" in verify_res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_verify_code_expired(client, db_session):
    # 1. Register
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "elena@example.com",
            "password": "Password123!",
            "full_name": "Elena Castro",
        },
    )
    result = await db_session.execute(select(User).where(User.email == "elena@example.com"))
    user = result.scalars().first()
    code = user.verification_code

    # Expire the code in DB
    user.verification_code_expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
    db_session.add(user)
    await db_session.commit()

    # 2. Try to verify expired code
    verify_res = await client.post(
        "/api/v1/auth/verify-code",
        json={"email": "elena@example.com", "code": code},
    )
    assert verify_res.status_code == 400
    assert "expirado" in verify_res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_resend_code_rate_limit_and_success(client, db_session):
    # 1. Register
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "fernando@example.com",
            "password": "Password123!",
            "full_name": "Fernando Torres",
        },
    )

    # 2. Immediate resend should trigger 429 Too Many Requests (cooldown active)
    resend_res = await client.post(
        "/api/v1/auth/resend-code",
        json={"email": "fernando@example.com"},
    )
    assert resend_res.status_code == 429
    assert "segundos" in resend_res.json()["detail"]

    # 3. Simulate cooldown passed by setting expires_at to 10 minutes remaining (which means 5 min elapsed)
    result = await db_session.execute(select(User).where(User.email == "fernando@example.com"))
    user = result.scalars().first()
    old_code = user.verification_code
    user.verification_code_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    db_session.add(user)
    await db_session.commit()

    # 4. Resend should now succeed
    with patch("resend.Emails.send", return_value={"id": "resend_mock"}):
        resend_ok = await client.post(
            "/api/v1/auth/resend-code",
            json={"email": "fernando@example.com"},
        )
        assert resend_ok.status_code == 200
        assert "éxito" in resend_ok.json()["message"]

        # Check that a new code was generated
        await db_session.refresh(user)
        assert user.verification_code != old_code
        assert len(user.verification_code) == 6
