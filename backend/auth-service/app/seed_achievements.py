from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.achievement import Achievement, AchievementCategory
from app.models.user_achievement import UserAchievement
from app.models.user import User

ACHIEVEMENTS = [
        {
            "name" : "First victory", "description" : "Win first game", "category" : AchievementCategory.COMBAT            
        },
        {
            "name" : "Five victory", "description" : "Win 5 games", "category" : AchievementCategory.COMBAT
        },
        {
            "name" : "Ten victory", "description" : "Win 10 games", "category" : AchievementCategory.COMBAT
        },
        {
            "name" : "Fifty victory", "description" : "Win 50 games", "category" : AchievementCategory.COMBAT
        },
        {
            "name" : "Hundred victory", "description" : "Win 100 games", "category" : AchievementCategory.COMBAT
        },
        ]

def seed_achievements():
    """Créer les achievements de base s'ils n'existent pas."""
    db = SessionLocal()
    
    try:
        created = 0
        for achievement_data in ACHIEVEMENTS:
            existing = db.query(Achievement).filter(
                Achievement.name == achievement_data["name"]
            ).first()
            
            if not existing:
                achievement = Achievement(**achievement_data)
                db.add(achievement)
                created += 1
                print(f"Created: {achievement_data['name']}")
            else:
                print(f"Already exists: {achievement_data['name']}")
        
        db.commit()
        print(f"\nSeed completed! {created} new achievements created, {len(ACHIEVEMENTS)} total.")
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding achievements...\n")
    Base.metadata.create_all(bind = engine)
    seed_achievements()
