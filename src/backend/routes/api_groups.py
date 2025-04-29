from fastapi import APIRouter, HTTPException
from database import driver

router = APIRouter(prefix="/api/groups", tags=["groups"])


@router.get("/{group_type}")
async def get_groups(group_type: str):
    valid_types = {"categories": "Category", "skillgroups": "SkillGroup", "technologygroups": "TechnologyGroup", "toolgroups": "ToolGroup"}
    if group_type not in valid_types.keys():
        raise HTTPException(status_code=400, detail="Invalid group type")
    try:
        with driver.session() as session:
            result = session.run(
                f"""
                MATCH (g:{valid_types[group_type]})
                RETURN g.name as name, g.description AS description
                ORDER BY toLower(g.name)
                """,
            )
            return [
                {"name": record["name"],
                 "description": record.get("description", ""),
                 "image": "http://localhost:8000/static/images/in_progress.jpg"}
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@router.get("/categories/search/{search_term}")
async def search_categories(search_term: str):
    return await search_group_type("Category", search_term)

@router.get("/skillgroups/search/{search_term}")
async def search_skillgroups(search_term: str):
    return await search_group_type("SkillGroup", search_term)

@router.get("/technologygroups/search/{search_term}")
async def search_technologygroups(search_term: str):
    return await search_group_type("TechnologyGroup", search_term)

@router.get("/toolgroups/search/{search_term}")
async def search_toolgroups(search_term: str):
    return await search_group_type("ToolGroup", search_term)

async def search_group_type(neo4j_label: str, search_term: str):
    try:
        with driver.session() as session:
            result = session.run(
                f"""
                MATCH (g:{neo4j_label})
                WHERE toLower(g.name) CONTAINS toLower($search_term)
                RETURN g.name AS name
                """,
                {"search_term": search_term.strip()}
            )
            return [record["name"] for record in result]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/id/{id}")
async def get_group_id(id: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (group)
                WHERE (group:Category OR group:SkillGroup OR group:TechnologyGroup OR group:ToolGroup)
                AND group.id = $id
                RETURN group
                LIMIT 1
                """,
                {"id": id}
            )
            record = result.single()

            if not record:
                raise HTTPException(status_code=404, detail="Group not found")

            group_node = record["group"]
            group_properties = dict(group_node)

            return {
                "name": group_properties.get("name"),
                "description": group_properties.get("description"),
                "image": "http://localhost:8000/static/images/in_progress.jpg"
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))