import pytest
from app.core.security import hash_password, verify_password, create_access_token, decode_token

def test_hash_password():
    hashed = hash_password("senha123")
    assert hashed != "senha123"
    assert verify_password("senha123", hashed)

def test_verify_password_wrong():
    hashed = hash_password("correta")
    assert not verify_password("errada", hashed)

def test_create_and_decode_token():
    user_id = "abc-123"
    token = create_access_token(user_id)
    decoded = decode_token(token)
    assert decoded == user_id

def test_token_invalid():
    from jose import JWTError
    with pytest.raises(JWTError):
        decode_token("token.invalido.aqui")
