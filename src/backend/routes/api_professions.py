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


@router.get("/{id}")
async def get_profession(id: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (p:Profession)
                WHERE p.id = $profession_id
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
                {"profession_id": id}
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
                ORDER BY c.name, p.name
                """
            )
            categories_professions = {}
            for record in result:
                category = record["category_name"]
                profession = record["profession_name"]
                if category not in categories_professions:
                    categories_professions[category] = []
                categories_professions[category].append(profession)
            return [
                {
                    "category": category,
                    "professions": professions,
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for category, professions in categories_professions.items()
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

@router.get("/filter/skills")
async def get_professions_sorted_by_skills():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (p:Profession)-[:BELONGS_TO]->(c:Category)
                OPTIONAL MATCH (p)-[:REQUIRES]->(s:Skill)
                RETURN p.name AS profession_name, c.name AS category_name, s.name AS skill_name
                ORDER BY s.name, p.name
                """
            )
            categories_professions = {}
            for record in result:
                category = record["category_name"]
                profession = record["profession_name"]
                if category not in categories_professions:
                    categories_professions[category] = set()  # Используем множество
                categories_professions[category].add(profession)  # Добавляем без дубликатов
            
            # Преобразуем множества обратно в списки
            return [
                {
                    "professions": list(professions),  # Конвертируем set в list
                    "category": category,
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for category, professions in categories_professions.items()
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

@router.get("/filter/technologies")
async def get_professions_sorted_by_technologies():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (p:Profession)-[:BELONGS_TO]->(c:Category)
                OPTIONAL MATCH (p)-[:USES_TECH]->(t:Technology)
                RETURN p.name AS profession_name, c.name AS category_name, t.name AS technology_name
                ORDER BY t.name, p.name
                """
            )
            categories_professions = {}
            for record in result:
                category = record["category_name"]
                profession = record["profession_name"]
                if category not in categories_professions:
                    categories_professions[category] = []
                categories_professions[category].append(profession)
            return [
                {
                    "category": category,
                    "professions": professions,
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for category, professions in categories_professions.items()
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

@router.get("/filter/tools")
async def get_professions_sorted_by_tools():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (p:Profession)-[:BELONGS_TO]->(c:Category)
                OPTIONAL MATCH (p)-[:USES_TOOL]->(t:Tool)
                RETURN p.name AS profession_name, c.name AS category_name, t.name AS tool_name
                ORDER BY t.name, p.name
                """
            )
            categories_professions = {}
            for record in result:
                category = record["category_name"]
                profession = record["profession_name"]
                if category not in categories_professions:
                    categories_professions[category] = []
                categories_professions[category].append(profession)
            return [
                {
                    "category": category,
                    "professions": professions,
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for category, professions in categories_professions.items()
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

@router.get("/search/{search_term}")
async def search_professions(search_term: str = ""):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (p:Profession)-[:BELONGS_TO]->(c:Category)
                WHERE toLower(p.name) CONTAINS toLower($search_term)
                RETURN p.name AS profession_name, c.name AS category_name
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
