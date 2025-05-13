from fastapi import APIRouter, HTTPException
from database import driver
import os

router = APIRouter(prefix="/api/tools", tags=["tools"])


@router.get("")
async def get_tools():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Tool)-[:GROUPS_TOOL]->(g:ToolGroup)
                RETURN t.name AS tool_name, t.description AS description, t.time AS time, g.name AS group_name, t.id AS id
                ORDER BY toLower(t.name)
                """
            )
            tools = []
            for record in result:
                tool_id = record["id"]
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                for ext in extensions:
                    file_path = os.path.join("static/images", f"{tool_id}{ext}")
                    if os.path.exists(file_path):
                        image_url = f"http://localhost:8000/static/images/{tool_id}{ext}"
                        break

                tools.append({
                    "tool": record["tool_name"],
                    "description": record["description"],
                    "time": record["time"],
                    "tool_group": record["group_name"],
                    "image": image_url
                })

            return tools
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{name}")
async def get_tool(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Tool)-[:GROUPS_TOOL]->(g:ToolGroup)
                WHERE t.name = $tool_name
                OPTIONAL MATCH (p:Profession)-[:USES_TOOL]->(t)
                RETURN t.name AS tool_name, t.description AS description, g.name AS group_name, collect(p.name) AS professions, t.id AS id
                """,
                {"tool_name": name}
            )
            record = result.single()
            if not record:
                raise HTTPException(status_code=404, detail="Tool not found")

            tool_id = record["id"]
            extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
            image_url = "http://localhost:8000/static/images/in_progress.jpg"

            for ext in extensions:
                file_path = os.path.join("static/images", f"{tool_id}{ext}")
                if os.path.exists(file_path):
                    image_url = f"http://localhost:8000/static/images/{tool_id}{ext}"
                    break

            return {
                "tool": record["tool_name"],
                "description": record["description"],
                "tool_group": record["group_name"],
                "professions": record["professions"],
                "image": image_url
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filter/toolgroups")
async def get_tools_sorted_by_toolgroups():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Tool)-[:GROUPS_TOOL]->(g:ToolGroup)
                RETURN t.name AS tool_name, t.description AS description, g.name AS group_name , t.id AS id
                ORDER BY toLower(g.name), toLower(t.name)
                """
            )
            tools = []
            for record in result:
                tool_id = record["id"]
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                for ext in extensions:
                    file_path = os.path.join("static/images", f"{tool_id}{ext}")
                    if os.path.exists(file_path):
                        image_url = f"http://localhost:8000/static/images/{tool_id}{ext}"
                        break

                tools.append({
                    "tool": record["tool_name"],
                    "description": record["description"],
                    "tool_group": record["group_name"],
                    "image": image_url
                })

            return tools
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filter/toolgroups/{name}")
async def get_tools_filtered_by_toolgroup(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Tool)-[:GROUPS_TOOL]->(g:ToolGroup)
                WHERE g.name = $name
                RETURN t.name AS tool_name, t.description AS description, g.name AS group_name, t.id AS id
                ORDER BY toLower(t.name)
                """,
                {"name": name}
            )
            tools = []
            for record in result:
                tool_id = record["id"]
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                for ext in extensions:
                    file_path = os.path.join("static/images", f"{tool_id}{ext}")
                    if os.path.exists(file_path):
                        image_url = f"http://localhost:8000/static/images/{tool_id}{ext}"
                        break
                tools.append({
                    "tool": record["tool_name"],
                    "description": record["description"],
                    "tool_group": record["group_name"],
                    "image": image_url
                })
            return tools
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/by_name/{search_term}")
async def search_tools_by_name(search_term: str = ""):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Tool)-[:GROUPS_TOOL]->(g:ToolGroup)
                WHERE toLower(t.name) CONTAINS toLower($search_term)
                RETURN t.name AS tool_name, t.description AS description, g.name AS group_name, t.id AS id
                ORDER BY toLower(t.name)
                """,
                {"search_term": search_term.strip()}
            )
            tools = []
            for record in result:
                tool_id = record["id"]
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                for ext in extensions:
                    file_path = os.path.join("static/images", f"{tool_id}{ext}")
                    if os.path.exists(file_path):
                        image_url = f"http://localhost:8000/static/images/{tool_id}{ext}"
                        break
                tools.append({
                    "tool": record["tool_name"],
                    "description": record["description"],
                    "tool_group": record["group_name"],
                    "image": image_url
                })
            return tools

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/by_description/{search_term}")
async def search_tools_by_description(search_term: str = ""):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Tool)-[:GROUPS_TOOL]->(g:ToolGroup)
                WHERE toLower(t.description) CONTAINS toLower($search_term)
                RETURN t.name AS tool_name, t.description AS description, g.name AS group_name, t.id AS id
                ORDER BY toLower(t.name)
                """,
                {"search_term": search_term.strip()}
            )
            tools = []
            for record in result:
                tool_id = record["id"]
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                for ext in extensions:
                    file_path = os.path.join("static/images", f"{tool_id}{ext}")
                    if os.path.exists(file_path):
                        image_url = f"http://localhost:8000/static/images/{tool_id}{ext}"
                        break
                tools.append({
                    "tool": record["tool_name"],
                    "description": record["description"],
                    "tool_group": record["group_name"],
                    "image": image_url
                })
            return tools

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
