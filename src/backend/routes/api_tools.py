from fastapi import APIRouter, HTTPException
from database import driver

router = APIRouter(prefix="/api/tools", tags=["tools"])


@router.get("")
async def get_tools():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Tool)-[:GROUPS_TOOL]->(g:ToolGroup)
                RETURN t.name AS tool_name, t.description AS description, g.name AS group_name
                ORDER BY toLower(t.name)
                """
            )
            return [
                {
                    "tool": record["tool_name"],
                    "description": record["description"],
                    "tool_group": record["group_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}")
async def get_tool(id: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Tool)-[:GROUPS_TOOL]->(g:ToolGroup)
                WHERE t.id = $tool_id
                OPTIONAL MATCH (p:Profession)-[:USES_TOOL]->(t)
                RETURN t.name AS tool_name, t.description AS description, g.name AS group_name, collect(p.name) AS professions
                """,
                {"tool_id": id}
            )
            record = result.single()
            
            if not record:
                raise HTTPException(status_code=404, detail="Tool not found")

            return {
                "tool": record["tool_name"], 
                "description": record["description"],
                "tool_group": record["group_name"],
                "professions": record["professions"],
                "image": "http://localhost:8000/static/images/in_progress.jpg"
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
                RETURN t.name AS tool_name, t.description AS description, g.name AS group_name
                ORDER BY toLower(g.name), toLower(t.name)
                """
            )
            return [
                {
                    "tool": record["tool_name"],
                    "description": record["description"],
                    "tool_group": record["group_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
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
                RETURN t.name AS tool_name, t.description AS description, g.name AS group_name
                ORDER BY toLower(t.name)
                """,
                {"name": name}
            )
            return [
                {
                    "tool": record["tool_name"],
                    "description": record["description"],
                    "tool_group": record["group_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
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
                RETURN t.name AS tool_name, t.description AS description, g.name AS group_name
                ORDER BY toLower(t.name)
                """,
                {"search_term": search_term.strip()}
            )
            return [
                {
                    "tool": record["tool_name"],
                    "description": record["description"],
                    "tool_group": record["group_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
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
                RETURN t.name AS tool_name, t.description AS description, g.name AS group_name
                ORDER BY toLower(t.name)
                """,
                {"search_term": search_term.strip()}
            )
            return [
                {
                    "tool": record["tool_name"],
                    "description": record["description"],
                    "tool_group": record["group_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
