import os

class Config:
    SECRET_KEY = 'your-secret-key-here'  # В реальном проекте это должно быть безопасное значение
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'railway.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "jwt-secret-key"  # Для JWT токенов
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 час