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
