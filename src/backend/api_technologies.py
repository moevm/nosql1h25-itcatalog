from fastapi import HTTPException
# include "main.py"
from docker.backend.main import driver, app

@app.get("/api/technologies")
async def get_technologies():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Technology)-[:GROUPS_TECH]->(g:TechnologyGroup)
                RETURN t.name AS tech_name, g.name AS group_name
                """
            )
            return [
                {
                    "technology": record["tech_name"],
                    "technology_group": record["group_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/technologies/{id}")
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
                "skill": record["technology_name"],
                "description": record["description"],
                "skill_group": record["group_name"],
                "professions": record["professions"],
                "image": "http://localhost:8000/static/images/in_progress.jpg"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/technologies/filter/technologygroups")
async def get_technologies_sorted_by_technologygroups():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Technology)-[:GROUPS_TECH]->(g:TechnologyGroup)
                RETURN t.name AS tech_name, g.name AS group_name
                ORDER BY g.name, t.name
                """
            )
            grouped_technologies = {}
            for record in result:
                group = record["group_name"]
                technology = record["tech_name"]
                if group not in grouped_technologies:
                    grouped_technologies[group] = []
                grouped_technologies[group].append(technology)
            return [
                {
                    "technologies": technologies,
                    "technology_group": group
                }
                for group, technologies in grouped_technologies.items()
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/technologies/filter/technologygroups/{name}")
async def get_technologies_filtered_by_technologygroup(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (g:TechnologyGroup)-[:GROUPS_TECH]->(t:Technology)
                WHERE g.name = $name
                RETURN t.name AS tech_name, g.name AS group_name
                """, {"name": name}
            )
            return [
                {
                    "technology_group": record["group_name"],
                    "technology": record["tech_name"]
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
