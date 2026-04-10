from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
#info project    
    PROJECT_NAME: str = "Auth Service - Ft_transcendence"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

#database
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: str = "5432"
    
    #property? permet d'utiliser une methode/fonction en attribut, ex : 
    #user.name comme une var et pas comme method , alors que ca devrait etre :
    #user.name() 
    @property
    def DATABASE_URL(self) -> str:
        """
        buid connexion url PostgreSQL
        Format: postgresql://user:password@host:port/database
        """
        return (f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}")

#security
    SECRET_KEY: str
    API_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

#cors
    BACKEND_CORS_ORIGINS: str = "https://localhost:3000,https://localhost:8080"

    @property
    def CORS_ORIGINS_LIST(self) -> list:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]
    model_config = ConfigDict(
        env_file=".env",
        case_sensitive = True,
        extra = "ignore"
        )
        # case sensitive veut dire sensible a la chaque char, maj , min etc
settings = Settings()
