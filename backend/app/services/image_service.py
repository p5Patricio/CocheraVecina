import os
import uuid
import io
from PIL import Image, ImageOps
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
}

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit for initial raw upload


class ImageService:
    @staticmethod
    async def process_and_save(
        file: UploadFile,
        subfolder: str = "spots",
        max_dimension: int = 1600,
        quality: int = 82,
    ) -> str:
        """
        Reads an uploaded image, normalizes orientation, strips EXIF (GPS/camera metadata),
        resizes to max_dimension, compresses into modern WebP format, and saves to the persistent media directory.

        Returns the public relative URL (e.g., /media/spots/a8f3...webp).
        """
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Formato no permitido: {file.content_type}. Formatos aceptados: JPEG, PNG, WebP.",
            )

        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo excede el tamaño máximo permitido de 10 MB.",
            )

        try:
            image = Image.open(io.BytesIO(contents))
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo no es una imagen válida o está dañado.",
            )

        # 1. Correct orientation according to EXIF (critical for smartphone photos)
        try:
            image = ImageOps.exif_transpose(image)
        except Exception:
            pass

        # 2. Convert color mode if necessary (e.g. CMYK or Palette to RGB)
        if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
            # WebP natively supports alpha transparency
            image = image.convert("RGBA")
        elif image.mode != "RGB":
            image = image.convert("RGB")

        # 3. Resize proportionally if larger than max_dimension
        if max(image.width, image.height) > max_dimension:
            image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

        # 4. Prepare target directory on persistent volume
        target_dir = os.path.join(settings.MEDIA_ROOT, subfolder)
        os.makedirs(target_dir, exist_ok=True)

        # 5. Save with new unique UUID in WebP format (strips EXIF automatically)
        filename = f"{uuid.uuid4().hex}.webp"
        file_path = os.path.join(target_dir, filename)

        image.save(
            file_path,
            format="WEBP",
            quality=quality,
            optimize=True,
            method=4,  # High compression speed/ratio trade-off
        )

        return f"{settings.MEDIA_URL}/{subfolder}/{filename}"
