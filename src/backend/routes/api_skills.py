from fastapi import APIRouter, HTTPException
from database import driver

router = APIRouter(prefix="/api/skills", tags=["skills"])


@router.get("")
async def get_skills():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (s:Skill)-[:GROUPS_SKILL]->(g:SkillGroup)
                RETURN s.name AS skill_name, g.name AS group_name
                ORDER BY toLower(s.name)
                """
            )
            return [
                {
                    "skill": record["skill_name"],
                    "skill_group": record["group_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{name}")
async def get_skill(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (s:Skill)-[:GROUPS_SKILL]->(g:SkillGroup)
                WHERE s.name = $skill_name
                OPTIONAL MATCH (p:Profession)-[:REQUIRES]->(s)
                RETURN s.name AS skill_name, g.name AS group_name, collect(p.name) AS professions
                """,
                {"skill_name": name}
            )
            record = result.single()
            if not record:
                raise HTTPException(status_code=404, detail="The skill not found")

            return {
                "skill": record["skill_name"],
                "skill_group": record["group_name"],
                "professions": record["professions"],
                "image": "http://localhost:8000/static/images/in_progress.jpg"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filter/skillgroups")
async def get_skills_sorted_by_skillgroups():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (s:Skill)-[:GROUPS_SKILL]->(g:SkillGroup)
                RETURN s.name AS skill_name, g.name AS group_name
                ORDER BY toLower(g.name), toLower(s.name)
                """
            )
            return [
                {
                    "skill": record["skill_name"],
                    "skill_group": record["group_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filter/skillgroups/{name}")
async def get_skills_filtered_by_skillgroup(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (s:Skill)-[:GROUPS_SKILL]->(g:SkillGroup)
                WHERE g.name = $name
                RETURN s.name AS skill_name, g.name AS group_name
                ORDER BY toLower(s.name)
                """,
                {"name": name}
            )
            return [
                {
                    "skill": record["skill_name"],
                    "skill_group": record["group_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
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
                RETURN s.name AS skill_name, g.name AS group_name
                ORDER BY toLower(s.name)
                """,
                {"search_term": search_term.strip()}
            )
            return [
                {
                    "skill": record["skill_name"],
                    "skill_group": record["group_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))       
