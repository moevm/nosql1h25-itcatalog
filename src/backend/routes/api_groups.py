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
            return [record["name"] for record in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@router.get("/search")
async def search_groups(search_term: str = ""):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (g:Group)
                WHERE toLower(g.name) CONTAINS toLower($search_term)
                RETURN g.name AS name, labels(g)[0] AS type
                """,
                {"search_term": search_term.strip()}
            )
            return [
                {
                    "name": record["name"],
                    "type": record["type"].removesuffix("Group").lower() + "groups"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
