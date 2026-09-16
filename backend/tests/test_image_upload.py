import io
import os
import pytest
from PIL import Image
from fastapi import UploadFile
from app.services.image_service import ImageService
from app.core.config import settings


@pytest.mark.asyncio
async def test_image_optimization_and_exif_stripping():
    # 1. Create a mock RGB image in memory
    img = Image.new("RGB", (2400, 1800), color=(73, 109, 137))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    buf.seek(0)

    upload_file = UploadFile(
        file=buf,
        filename="test_phone_photo.jpg",
        headers={"content-type": "image/jpeg"},
    )

    # 2. Process image with ImageService
    rel_url = await ImageService.process_and_save(
        upload_file,
        subfolder="test_spots",
        max_dimension=1200,
        quality=80,
    )

    assert rel_url.startswith("/media/test_spots/")
    assert rel_url.endswith(".webp")

    # 3. Check physical file
    disk_path = os.path.join(settings.MEDIA_ROOT, "test_spots", os.path.basename(rel_url))
    assert os.path.exists(disk_path)

    # 4. Open saved image and verify format & resize
    with Image.open(disk_path) as saved_img:
        assert saved_img.format == "WEBP"
        assert max(saved_img.width, saved_img.height) <= 1200
        # Verify EXIF is stripped
        exif = saved_img.getexif()
        assert len(exif) == 0

    # Cleanup test file
    if os.path.exists(disk_path):
        os.remove(disk_path)


@pytest.mark.asyncio
async def test_image_upload_and_media_flow(client):
    created_files = []
    try:
        # 1. Register and login a user
        reg_res = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "media_host@example.com",
                "password": "SecurePassword123!",
                "full_name": "Media Host User",
                "phone": "+524771239999",
            },
        )
        assert reg_res.status_code == 201

        login_res = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "media_host@example.com",
                "password": "SecurePassword123!",
            },
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Upload avatar
        avatar_img = Image.new("RGB", (300, 300), color=(120, 160, 200))
        avatar_buf = io.BytesIO()
        avatar_img.save(avatar_buf, format="JPEG")
        avatar_buf.seek(0)

        avatar_res = await client.post(
            "/api/v1/auth/avatar",
            headers=headers,
            files={"file": ("avatar.jpg", avatar_buf, "image/jpeg")},
        )
        assert avatar_res.status_code == 200
        avatar_data = avatar_res.json()
        assert "avatar_url" in avatar_data
        avatar_url = avatar_data["avatar_url"]
        assert avatar_url is not None
        assert avatar_url.endswith(".webp")

        avatar_disk_path = os.path.join(settings.MEDIA_ROOT, "avatars", os.path.basename(avatar_url))
        created_files.append(avatar_disk_path)

        # 3. Request GET {avatar_url} with client and assert status 200 and image/webp content-type
        avatar_get = await client.get(avatar_url)
        assert avatar_get.status_code == 200
        assert "image/webp" in avatar_get.headers.get("content-type", "")

        # 4. Create a spot
        spot_res = await client.post(
            "/api/v1/spots/",
            headers=headers,
            json={
                "title": "Cochera con Fotos en León",
                "description": "Espacio seguro y techado con acceso fácil.",
                "address_line": "Blvd Juan Alonso de Torres 1234",
                "city": "León",
                "state": "Guanajuato",
                "country": "MX",
                "postal_code": "37150",
                "latitude": 21.1400,
                "longitude": -101.6800,
                "price_per_day": 20000,
                "vehicle_size": "sedan",
                "space_type": "covered",
            },
        )
        assert spot_res.status_code == 201
        spot_id = spot_res.json()["id"]

        # 5. Upload photo using POST /api/v1/spots/{spot_id}/upload-photo
        spot_img = Image.new("RGB", (1200, 800), color=(70, 130, 90))
        spot_buf = io.BytesIO()
        spot_img.save(spot_buf, format="JPEG")
        spot_buf.seek(0)

        photo_res = await client.post(
            f"/api/v1/spots/{spot_id}/upload-photo",
            headers=headers,
            files={"file": ("spot.jpg", spot_buf, "image/jpeg")},
        )
        assert photo_res.status_code == 201
        photo_data = photo_res.json()
        assert "url" in photo_data
        spot_photo_url = photo_data["url"]
        assert spot_photo_url.endswith(".webp")

        spot_disk_path = os.path.join(settings.MEDIA_ROOT, "spots", os.path.basename(spot_photo_url))
        created_files.append(spot_disk_path)

        # 6. Verify GET on that spot image returns 200 and image/webp
        spot_photo_get = await client.get(spot_photo_url)
        assert spot_photo_get.status_code == 200
        assert "image/webp" in spot_photo_get.headers.get("content-type", "")

        # 7. Verify another user uploading to the spot receives 403 Forbidden
        reg_other = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "unauthorized_user@example.com",
                "password": "SecurePassword123!",
                "full_name": "Unauthorized User",
                "phone": "+524775551234",
            },
        )
        assert reg_other.status_code == 201

        login_other = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "unauthorized_user@example.com",
                "password": "SecurePassword123!",
            },
        )
        assert login_other.status_code == 200
        other_token = login_other.json()["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}

        other_buf = io.BytesIO()
        spot_img.save(other_buf, format="JPEG")
        other_buf.seek(0)

        unauth_upload_res = await client.post(
            f"/api/v1/spots/{spot_id}/upload-photo",
            headers=other_headers,
            files={"file": ("hacked.jpg", other_buf, "image/jpeg")},
        )
        assert unauth_upload_res.status_code == 403

    finally:
        # 8. Clean up any generated media files under settings.MEDIA_ROOT
        for file_path in created_files:
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except OSError:
                    pass

