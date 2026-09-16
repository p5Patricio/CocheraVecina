import pytest


@pytest.mark.asyncio
async def test_auth_and_spot_flow(client):
    # 1. Register User
    reg_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "carlos@example.com",
            "password": "SecurePassword123!",
            "full_name": "Carlos Mendoza",
            "phone": "+524771234567",
        },
    )
    assert reg_response.status_code == 201
    user_data = reg_response.json()
    assert user_data["email"] == "carlos@example.com"

    # 2. Login
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "carlos@example.com",
            "password": "SecurePassword123!",
        },
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Parking Spot in León
    spot_response = await client.post(
        "/api/v1/spots/",
        headers=headers,
        json={
            "title": "Cochera privada cerca de Plaza Mayor",
            "description": "Portón eléctrico, espacio techado y muy seguro.",
            "address_line": "Paseo del Moral 450",
            "city": "León",
            "state": "Guanajuato",
            "country": "MX",
            "postal_code": "37160",
            "latitude": 21.1550,
            "longitude": -101.6950,
            "price_per_day": 18000,  # $180 MXN
            "vehicle_size": "sedan",
            "space_type": "covered",
        },
    )
    assert spot_response.status_code == 201
    spot = spot_response.json()
    assert spot["city"] == "León"
    assert spot["price_per_day"] == 18000

    # 4. Search Parking Spots
    search_response = await client.get("/api/v1/spots/?city=león")
    assert search_response.status_code == 200
    results = search_response.json()
    assert len(results) >= 1
    assert results[0]["title"] == "Cochera privada cerca de Plaza Mayor"
