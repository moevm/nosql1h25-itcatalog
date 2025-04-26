from fastapi import APIRouter, HTTPException
from database import driver

router = APIRouter(prefix="/api/technologies", tags=["technologies"])


@router.get("")
async def get_technologies():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Technology)-[:GROUPS_TECH]->(g:TechnologyGroup)
                RETURN t.name AS technology_name, t.description AS description, g.name AS group_name
                ORDER BY toLower(t.name)
                """
            )
            return [
                {
                    "technology": record["technology_name"],
                    "description": record["description"],
                    "technology_group": record["group_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}")
async def get_technology(id: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Technology)-[:GROUPS_TECH]->(g:TechnologyGroup)
                WHERE t.id = $technology_id
                OPTIONAL MATCH (p:Profession)-[:USES_TECH]->(t)
                RETURN t.name AS technology_name, t.description AS description, g.name AS group_name, collect(p.name) AS professions
                """,
                {"technology_id": id}
            )
            record = result.single()
            if not record:
                raise HTTPException(status_code=404, detail="The technology not found")

            return {
                "technology": record["technology_name"],
                "description": record["description"],
                "technology_group": record["group_name"],
                "professions": record["professions"],
                "image": "http://localhost:8000/static/images/in_progress.jpg"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filter/technologygroups")
async def get_technologies_sorted_by_technologygroups():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Technology)-[:GROUPS_TECH]->(g:TechnologyGroup)
                RETURN t.name AS technology_name, t.description AS description, g.name AS group_name
                ORDER BY toLower(g.name), toLower(t.name)
                """
            )
            return [
                {
                    "technology": record["technology_name"],
                    "description": record["description"],
                    "technology_group": record["group_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filter/technologygroups/{name}")
async def get_technologies_filtered_by_technologygroup(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Technology)-[:GROUPS_TECH]->(g:TechnologyGroup)
                WHERE g.name = $name
                RETURN t.name AS technology_name, t.description AS description, g.name AS group_name
                ORDER BY toLower(t.name)
                """,
                {"name": name}
            )
            return [
                {
                    "technology": record["technology_name"],
                    "description": record["description"],
                    "technology_group": record["group_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/{search_term}")
async def search_technologies(search_term: str = ""):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Technology)-[:GROUPS_TECH]->(g:TechnologyGroup)
                WHERE toLower(t.name) CONTAINS toLower($search_term)
                   OR toLower(t.description) CONTAINS toLower($search_term)
                RETURN t.name AS technology_name, t.description AS description, g.name AS group_name
                ORDER BY toLower(t.name)
                """,
                {"search_term": search_term.strip()}
            )
            return [
                {
                    "technology": record["technology_name"],
                    "description": record["description"],
                    "technology_group": record["group_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
