from fastapi import APIRouter, HTTPException
from database import driver
import os

router = APIRouter(prefix="/api/technologies", tags=["technologies"])


@router.get("")
async def get_technologies():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Technology)-[:GROUPS_TECH]->(g:TechnologyGroup)
                RETURN t.name AS technology_name, t.description AS description, g.name AS group_name, t.id AS id
                ORDER BY toLower(t.name)
                """
            )
            technologies = []
            for record in result:
                tech_id = record["id"]
                static_path = "static/images"
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                for ext in extensions:
                    file_path = os.path.join(static_path, f"{tech_id}{ext}")
                    if os.path.exists(file_path):
                        image_url = f"http://localhost:8000/static/images/{tech_id}{ext}"
                        break

                technologies.append({
                    "technology": record["technology_name"],
                    "description": record["description"],
                    "technology_group": record["group_name"],
                    "image": image_url
                })

            return technologies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{name}")
async def get_technology(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Technology)-[:GROUPS_TECH]->(g:TechnologyGroup)
                WHERE t.name = $technology_name
                OPTIONAL MATCH (p:Profession)-[:USES_TECH]->(t)
                RETURN t.name AS technology_name, t.description AS description, g.name AS group_name, collect(p.name) AS professions, t.id AS id
                """,
                {"technology_name": name}
            )
            record = result.single()
            if not record:
                raise HTTPException(status_code=404, detail="The technology not found")

            tech_id = record["id"]
            extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
            image_url = "http://localhost:8000/static/images/in_progress.jpg"
            
            for ext in extensions:
                if os.path.exists(f"static/images/{tech_id}{ext}"):
                    image_url = f"http://localhost:8000/static/images/{tech_id}{ext}"
                    break

            return {
                "technology": record["technology_name"],
                "description": record["description"],
                "technology_group": record["group_name"],
                "professions": record["professions"],
                "image": image_url
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
                RETURN t.name AS technology_name, t.description AS description, g.name AS group_name, t.id AS id
                ORDER BY toLower(g.name), toLower(t.name)
                """
            )
            technologies = []
            for record in result:
                tech_id = record["id"]
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                for ext in extensions:
                    if os.path.exists(f"static/images/{tech_id}{ext}"):
                        image_url = f"http://localhost:8000/static/images/{tech_id}{ext}"
                        break

                technologies.append({
                    "technology": record["technology_name"],
                    "description": record["description"],
                    "technology_group": record["group_name"],
                    "image": image_url
                })

            return technologies
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
                RETURN t.name AS technology_name, t.description AS description, g.name AS group_name, t.id AS id
                ORDER BY toLower(t.name)
                """,
                {"name": name}
            )
            technologies = []
            for record in result:
                tech_id = record["id"]
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                for ext in extensions:
                    if os.path.exists(f"static/images/{tech_id}{ext}"):
                        image_url = f"http://localhost:8000/static/images/{tech_id}{ext}"
                        break

                technologies.append({
                    "technology": record["technology_name"],
                    "description": record["description"],
                    "technology_group": record["group_name"],
                    "image": image_url
                })

            return technologies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/by_name/{search_term}")
async def search_technologies_by_name(search_term: str = ""):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Technology)-[:GROUPS_TECH]->(g:TechnologyGroup)
                WHERE toLower(t.name) CONTAINS toLower($search_term)
                RETURN t.name AS technology_name, t.description AS description, g.name AS group_name, t.id AS id
                ORDER BY toLower(t.name)
                """,
                {"search_term": search_term.strip()}
            )
            technologies = []
            for record in result:
                tech_id = record["id"]
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                for ext in extensions:
                    if os.path.exists(f"static/images/{tech_id}{ext}"):
                        image_url = f"http://localhost:8000/static/images/{tech_id}{ext}"
                        break

                technologies.append({
                    "technology": record["technology_name"],
                    "description": record["description"],
                    "technology_group": record["group_name"],
                    "image": image_url
                })

            return technologies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/search/by_description/{search_term}")
async def search_technologies_by_description(search_term: str = ""):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Technology)-[:GROUPS_TECH]->(g:TechnologyGroup)
                WHERE toLower(t.description) CONTAINS toLower($search_term)
                RETURN t.name AS technology_name, t.description AS description, g.name AS group_name, t.id AS id
                ORDER BY toLower(t.name)
                """,
                {"search_term": search_term.strip()}
            )
            technologies = []
            for record in result:
                tech_id = record["id"]
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                for ext in extensions:
                    file_path = os.path.join("static/images", f"{tech_id}{ext}")
                    if os.path.exists(file_path):
                        image_url = f"http://localhost:8000/static/images/{tech_id}{ext}"
                        break

                technologies.append({
                    "technology": record["technology_name"],
                    "description": record["description"],
                    "technology_group": record["group_name"],
                    "image": image_url
                })

            return technologies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
