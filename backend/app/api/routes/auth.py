from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, UserCreate, UserRead
from datetime import timedelta
from app.core.config import settings
import logging

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/users/", response_model=UserRead)
async def register_user(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_session)
):
    """Register a new user."""
    # Check if user already exists
    statement = select(User).where(User.email == user_data.email)
    result = await session.exec(statement)
    existing_user = result.first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)
    logger.info(f"DEBUG: Original password: {user_data.password}")
    logger.info(f"DEBUG: Hashed password: {hashed_password}")
    
    db_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        password=hashed_password,
        is_active=user_data.is_active
    )
    
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    
    logger.info(f"DEBUG: User created with ID: {db_user.id}")
    return db_user


@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_session)
):
    """Login and get access token."""
    logger.info(f"DEBUG: Login attempt for email: {form_data.username}")
    logger.info(f"DEBUG: Login password: {form_data.password}")
    
    # Find user by email (username field in form)
    statement = select(User).where(User.email == form_data.username)
    result = await session.exec(statement)
    user = result.first()
    
    if not user:
        logger.info("DEBUG: User not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    logger.info(f"DEBUG: User found: {user.email}")
    logger.info(f"DEBUG: Stored password hash: {user.password}")
    
    password_valid = verify_password(form_data.password, user.password)
    logger.info(f"DEBUG: Password verification result: {password_valid}")
    
    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    logger.info("DEBUG: Login successful, token created")
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }