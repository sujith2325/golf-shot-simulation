from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
import bcrypt

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    handicap = Column(Float, default=18.0)
    avatar = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    shots = relationship("ShotRecord", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password):
        # bcrypt requires bytes
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "handicap": self.handicap,
            "avatar": self.avatar
        }

class ShotRecord(Base):
    __tablename__ = 'shot_records'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    club_used = Column(String(20), nullable=False)
    club_speed = Column(Float, nullable=False)
    launch_angle = Column(Float, nullable=False)
    path_angle = Column(Float, nullable=False)
    spin_rate = Column(Float, nullable=False)
    spin_tilt = Column(Float, nullable=False)
    
    # Environment variables
    wind_speed = Column(Float, default=0.0)
    wind_dir = Column(Float, default=0.0) # degrees from target line
    temp = Column(Float, default=70.0) # Fahrenheit
    humidity = Column(Float, default=50.0) # percentage
    altitude = Column(Float, default=0.0) # feet
    terrain = Column(String(20), default="Fairway") # Fairway, Rough, Sand, etc.
    
    # Computed metrics
    carry_distance = Column(Float, nullable=False) # yards
    total_distance = Column(Float, nullable=False) # yards
    max_height = Column(Float, nullable=False) # yards
    hang_time = Column(Float, nullable=False) # seconds
    
    # Trajectory coordinates (JSON serialized list of {x, y, z, v, spin, time})
    trajectory_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="shots")

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "user_id": self.user_id,
            "club_used": self.club_used,
            "club_speed": self.club_speed,
            "launch_angle": self.launch_angle,
            "path_angle": self.path_angle,
            "spin_rate": self.spin_rate,
            "spin_tilt": self.spin_tilt,
            "wind_speed": self.wind_speed,
            "wind_dir": self.wind_dir,
            "temp": self.temp,
            "humidity": self.humidity,
            "altitude": self.altitude,
            "terrain": self.terrain,
            "carry_distance": self.carry_distance,
            "total_distance": self.total_distance,
            "max_height": self.max_height,
            "hang_time": self.hang_time,
            "trajectory": json.loads(self.trajectory_json),
            "created_at": self.created_at.isoformat()
        }

# DB Setup Helper
DATABASE_URL = "sqlite:///golfvision.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
