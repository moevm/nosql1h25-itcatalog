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
                RETURN t.name AS tool_name, g.name AS group_name
                """
            )
            return [
                {
                    "tool": record["tool_name"],
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
            if not result:
                raise HTTPException(status_code=404, detail="The tool not found")

            return {
                "tool": result["technology_name"],
                "description": result["description"],
                "tool_group": result["group_name"],
                "professions": result["professions"],
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
                RETURN t.name AS tool_name, g.name AS group_name
                ORDER BY g.name, t.name
                """
            )
            grouped_tools = {}
            for record in result:
                group = record["group_name"]
                tool = record["tool_name"]
                if group not in grouped_tools:
                    grouped_tools[group] = []
                grouped_tools[group].append(tool)
            return [
                {
                    "tool_group": group,
                    "tools": tools
                }
                for group, tools in grouped_tools.items()
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/filter/toolgroups/{name}")
async def get_tools_filtered_by_toolgroup(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (g:ToolGroup)-[:GROUPS_TOOL]->(t:Tool)
                WHERE g.name = $name
                RETURN t.name AS tool_name, g.name AS group_name
                """,
                {"name": name}
            )
            return [
                {
                    "tool": record["tool_name"],
                    "tool_group": record["group_name"]
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@router.get("/search/{search_term}")
async def search_tools(search_term: str = ""):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Tool)-[:GROUPS_TOOL]->(g:ToolGroup)
                WHERE toLower(t.name) CONTAINS toLower($search_term)
                RETURN t.name AS tool_name, g.name AS group_name
                """,
                {"search_term": search_term.strip()}
            )
            return [
                {
                    "tool": record["tool_name"],
                    "tool_group": record["group_name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
