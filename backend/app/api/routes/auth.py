from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import traceback
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.auth import UserCreate, UserLogin, TokenResponse, UserResponse
from app.services.auth_service import create_user, authenticate_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        return create_user(db, user_data)
    except HTTPException:
        raise
    except Exception as e:
        print("REGISTER ERROR:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    try:
        token, user = authenticate_user(db, credentials.email, credentials.password)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
    except HTTPException:
        raise
    except Exception as e:
        print("LOGIN ERROR:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me", response_model=UserResponse)
def get_me(current_user=Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=list[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    from app.models.models import User
    return db.query(User).filter(User.is_active == True).all()