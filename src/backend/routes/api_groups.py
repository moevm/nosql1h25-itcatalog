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
                f"MATCH (g:{valid_types[group_type]}) RETURN g.name as name"
            )
            return [
                {
                    "name": record["name"],
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
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
