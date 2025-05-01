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
                {
                    "name": record["name"],
                    "description": record.get("description", ""),
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories/search/by_name/{search_term}")
async def search_categories_by_name(search_term: str):
    return await search_group_type_by_name("Category", search_term)

@router.get("/skillgroups/search/by_name/{search_term}")
async def search_skillgroups_by_name(search_term: str):
    return await search_group_type_by_name("SkillGroup", search_term)

@router.get("/technologygroups/search/by_name/{search_term}")
async def search_technologygroups_by_name(search_term: str):
    return await search_group_type_by_name("TechnologyGroup", search_term)

@router.get("/toolgroups/search/by_name/{search_term}")
async def search_toolgroups_by_name(search_term: str):
    return await search_group_type_by_name("ToolGroup", search_term)

async def search_group_type_by_name(neo4j_label: str, search_term: str):
    try:
        with driver.session() as session:
            result = session.run(
                f"""
                MATCH (g:{neo4j_label})
                WHERE toLower(g.name) CONTAINS toLower($search_term)
                RETURN g.name as name, g.description AS description
                ORDER BY toLower(g.name)
                """,
                {"search_term": search_term.strip()}
            )
            return [
                {
                    "name": record["name"],
                    "description": record.get("description", ""),
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories/search/by_description/{search_term}")
async def search_categories_by_description(search_term: str):
    return await search_group_type_by_description("Category", search_term)

@router.get("/skillgroups/search/by_description/{search_term}")
async def search_skillgroups_by_description(search_term: str):
    return await search_group_type_by_description("SkillGroup", search_term)

@router.get("/technologygroups/search/by_description/{search_term}")
async def search_technologygroups_by_description(search_term: str):
    return await search_group_type_by_description("TechnologyGroup", search_term)

@router.get("/toolgroups/search/by_description/{search_term}")
async def search_toolgroups_by_description(search_term: str):
    return await search_group_type_by_description("ToolGroup", search_term)

async def search_group_type_by_description(neo4j_label: str, search_term: str):
    try:
        with driver.session() as session:
            result = session.run(
                f"""
                MATCH (g:{neo4j_label})
                WHERE toLower(g.description) CONTAINS toLower($search_term)
                RETURN g.name as name, g.description AS description
                ORDER BY toLower(g.name)
                """,
                {"search_term": search_term.strip()}
            )
            return [
                {
                    "name": record["name"],
                    "description": record.get("description", ""),
                    "image": "http://localhost:8000/static/images/in_progress.jpg"
                }
                for record in result
            ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/name/{name}")
async def get_group_name(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (g)
                WHERE (g:Category OR g:SkillGroup OR g:TechnologyGroup OR g:ToolGroup)
                AND g.name = $name
                OPTIONAL MATCH (g)<-[:BELONGS_TO]-(p:Profession)
                OPTIONAL MATCH (g)<-[GROUPS_SKILL]-(s:Skill)
                OPTIONAL MATCH (g)<-[:GROUPS_TECH]-(t:Technology)
                OPTIONAL MATCH (g)<-[:GROUPS_TOOL]-(tool:Tool)
                WITH g, collect(DISTINCT p.name) AS professions, 
                    collect(DISTINCT s.name) AS skills, 
                    collect(DISTINCT t.name) AS technologies, 
                    collect(DISTINCT tool.name) AS tools
                RETURN g.name AS group_name, g.description AS description, 
                    professions + skills + technologies + tools AS participants
                LIMIT 1 
                """,
                {"name": name}
            )
            record = result.single()

            if not record:
                raise HTTPException(status_code=404, detail="Group not found")

            return {
                "name":  record["group_name"],
                "description": record["description"],
                "participants": record["participants"], # участники группы, будь то професии, навыки, технологии или инструменты
                "image": "http://localhost:8000/static/images/in_progress.jpg"
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
