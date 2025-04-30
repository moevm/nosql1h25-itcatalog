from fastapi import APIRouter, HTTPException
from database import driver

router = APIRouter(prefix="/api/professions", tags=["professions"])


@router.get("")
async def get_professions():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (p:Profession)-[:BELONGS_TO]->(c:Category)
                RETURN p.name AS profession_name, c.name AS category_name
                ORDER BY toLower(p.name)
                """
            )
            return [
                {
                    "profession": record["profession_name"],
                    "category": record["category_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{name}")
async def get_profession(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (p:Profession)
                WHERE p.name = $profession_name
                OPTIONAL MATCH (p)-[:REQUIRES]->(s:Skill)
                OPTIONAL MATCH (p)-[:USES_TECH]->(t:Technology)
                OPTIONAL MATCH (p)-[:USES_TOOL]->(tool:Tool)
                OPTIONAL MATCH (p)-[:BELONGS_TO]->(c:Category)
                RETURN p.name AS profession_name,
                       c.name AS category_name,
                       collect(DISTINCT s.name) AS skills,
                       collect(DISTINCT t.name) AS technologies,
                       collect(DISTINCT tool.name) AS tools
                """,
                {"profession_name": name}
            )
            record = result.single()
            if not record:
                raise HTTPException(status_code=404, detail="Profession not found")
            return {
                "profession": record["profession_name"],
                "category": record["category_name"],
                "skills": record["skills"],
                "technologies": record["technologies"],
                "tools": record["tools"],
                "image": "http://localhost:8000/static/images/in_progress.jpg"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filter/categories")
async def get_professions_sorted_by_categories():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (p:Profession)-[:BELONGS_TO]->(c:Category)
                RETURN p.name AS profession_name, c.name AS category_name
                ORDER BY toLower(category_name), toLower(p.name)
                """
            )
            return [
                {
                    "profession": record["profession_name"],
                    "category": record["category_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filter/categories/{name}")
async def get_professions_filtered_by_category(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (c:Category)<-[:BELONGS_TO]-(p:Profession)
                WHERE c.name = $name
                RETURN p.name AS profession_name, c.name AS category_name
                ORDER BY toLower(p.name)
                """,
                {"name": name}
            )
            return [
                {
                    "profession": record["profession_name"],
                    "category": record["category_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filter/skills/{name}")
async def get_professions_filtered_by_skill(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (s:Skill)<-[:REQUIRES]-(p:Profession)-[:BELONGS_TO]->(c:Category)
                WHERE s.name = $name
                RETURN DISTINCT p.name AS profession_name, c.name AS category_name
                ORDER BY toLower(p.name)
                """,
                {"name": name}
            )
            return [
                {
                    "profession": record["profession_name"],
                    "category": record["category_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filter/technologies/{name}")
async def get_professions_filtered_by_technology(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Technology)<-[:USES_TECH]-(p:Profession)-[:BELONGS_TO]->(c:Category)
                WHERE t.name = $name
                RETURN DISTINCT p.name AS profession_name, c.name AS category_name
                ORDER BY toLower(p.name)
                """,
                {"name": name}
            )
            return [
                {
                    "profession": record["profession_name"],
                    "category": record["category_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filter/tools/{name}")
async def get_professions_filtered_by_tool(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Tool)<-[:USES_TOOL]-(p:Profession)-[:BELONGS_TO]->(c:Category)
                WHERE t.name = $name
                RETURN DISTINCT p.name AS profession_name, c.name AS category_name
                ORDER BY toLower(p.name)
                """,
                {"name": name}
            )
            return [
                {
                    "profession": record["profession_name"],
                    "category": record["category_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/by_name/{search_term}")
async def search_professions_by_name(search_term: str = ""):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (p:Profession)-[:BELONGS_TO]->(c:Category)
                WHERE toLower(p.name) CONTAINS toLower($search_term)
                RETURN p.name AS profession_name, c.name AS category_name
                ORDER BY toLower(p.name)
                """,
                {"search_term": search_term.strip()}
            )
            return [
                {
                    "profession": record["profession_name"],
                    "category": record["category_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
