import boto3
from app.core.settings import settings

def get_r2_client():
    if not settings.R2_ACCOUNT_ID:
        return None
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )

def upload_file(key: str, data: bytes, content_type: str = "text/csv") -> bool:
    client = get_r2_client()
    if not client:
        return False
    client.put_object(Bucket=settings.R2_BUCKET, Key=key, Body=data, ContentType=content_type)
    return True

def get_presigned_url(key: str, expires: int = 900) -> str | None:
    client = get_r2_client()
    if not client:
        return None
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.R2_BUCKET, "Key": key},
        ExpiresIn=expires,
    )