from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

def _create_engine():
    try:
        engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=settings.DEBUG,
        )
        with engine.connect():
            pass
        return engine
    except OperationalError:
        fallback_path = Path(__file__).resolve().parents[2] / "biogentix.db"
        return create_engine(
            f"sqlite:///{fallback_path.as_posix()}",
            connect_args={"check_same_thread": False},
            echo=settings.DEBUG,
        )


engine = _create_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()