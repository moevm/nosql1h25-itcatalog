from fastapi import APIRouter, HTTPException
from database import driver
import os

router = APIRouter(prefix="/api/skills", tags=["skills"])


@router.get("")
async def get_skills():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (s:Skill)-[:GROUPS_SKILL]->(g:SkillGroup)
                RETURN s.name AS skill_name, g.name AS group_name, s.id AS id, s.time AS time
                ORDER BY toLower(s.name)
                """
            )

            skills = []
            for record in result:
                skill_id = record["id"]
                static_path = "static/images"
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                # Проверяем существование файла изображения
                for ext in extensions:
                    file_path = os.path.join(static_path, f"{skill_id}{ext}")
                    if os.path.exists(file_path):
                        image_url = f"http://localhost:8000/static/images/{skill_id}{ext}"
                        break

                skills.append({
                    "skill": record["skill_name"],
                    "skill_group": record["group_name"],
                    "image": image_url,
                    "time": record["time"]
                })

            if not skills:
                raise HTTPException(
                    status_code=404,
                    detail="No skills found in the database"
                )

            return skills

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch skills: {str(e)}"
        )


@router.get("/{name}")
async def get_skill(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (s:Skill)-[:GROUPS_SKILL]->(g:SkillGroup)
                WHERE s.name = $skill_name
                OPTIONAL MATCH (p:Profession)-[:REQUIRES]->(s)
                RETURN s.name AS skill_name, s.time AS time, g.name AS group_name, collect(p.name) AS professions, s.id AS id
                """,
                {"skill_name": name}
            )
            record = result.single()
            if not record:
                raise HTTPException(
                    status_code=404,
                    detail=f"Skill with name '{name}' not found"
                )

            # Определяем расширение изображения
            skill_id = record["id"]
            static_path = "static/images"
            extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
            image_url = "http://localhost:8000/static/images/in_progress.jpg"

            for ext in extensions:
                file_path = os.path.join(static_path, f"{skill_id}{ext}")
                if os.path.exists(file_path):
                    image_url = f"http://localhost:8000/static/images/{skill_id}{ext}"
                    break

            return {
                "skill": record["skill_name"],
                "time": record["time"],
                "skill_group": record["group_name"],
                "professions": record["professions"],
                "description": record.get("description", ""),
                "image": image_url
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch skill: {str(e)}"
        )

@router.get("/filter/skillgroups")
async def get_skills_sorted_by_skillgroups():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (s:Skill)-[:GROUPS_SKILL]->(g:SkillGroup)
                RETURN s.name AS skill_name, g.name AS group_name, s.id AS id
                ORDER BY toLower(g.name), toLower(s.name)
                """
            )
            skills = []
            for record in result:
                skill_id = record["id"]
                static_path = "static/images"
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                # Проверяем существование файла изображения
                for ext in extensions:
                    file_path = os.path.join(static_path, f"{skill_id}{ext}")
                    if os.path.exists(file_path):
                        image_url = f"/static/images/{skill_id}{ext}"
                        break

                skills.append({
                    "skill": record["skill_name"],
                    "skill_group": record["group_name"],
                    "image": image_url
                })

            if not skills:
                raise HTTPException(
                    status_code=404,
                    detail="No skills found in any skill groups"
                )

            return skills

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch skills grouped by skill groups: {str(e)}"
        )

@router.get("/filter/skillgroups/{name}")
async def get_skills_filtered_by_skillgroup(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (s:Skill)-[:GROUPS_SKILL]->(g:SkillGroup)
                WHERE g.name = $name
                RETURN s.name AS skill_name, g.name AS group_name, s.id AS id
                ORDER BY toLower(s.name)
                """,
                {"name": name}
            )
            skills = []
            for record in result:
                skill_id = record["id"]
                static_path = "static/images"
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                # Проверяем существование файла изображения
                for ext in extensions:
                    file_path = os.path.join(static_path, f"{skill_id}{ext}")
                    if os.path.exists(file_path):
                        image_url = f"/static/images/{skill_id}{ext}"
                        break
                skills.append({
                    "skill": record["skill_name"],
                    "skill_group": record["group_name"],
                    "image": image_url
                })
            return skills
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/by_name/{search_term}")
async def search_skills_by_name(search_term: str = ""):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (s:Skill)-[:GROUPS_SKILL]->(g:SkillGroup)
                WHERE toLower(s.name) CONTAINS toLower($search_term)
                RETURN s.name AS skill_name, g.name AS group_name, s.id AS id
                ORDER BY toLower(s.name)
                """,
                {"search_term": search_term.strip()}
            )
            skills = []
            for record in result:
                skill_id = record["id"]
                static_path = "static/images"
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                for ext in extensions:
                    file_path = os.path.join(static_path, f"{skill_id}{ext}")
                    if os.path.exists(file_path):
                        image_url = f"http://localhost:8000/static/images/{skill_id}{ext}"
                        break

                skills.append({
                    "skill": record["skill_name"],
                    "skill_group": record["group_name"],
                    "image": image_url
                })

            return skills
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))       
