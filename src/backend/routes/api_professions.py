from fastapi import APIRouter, HTTPException
from database import driver
import os

router = APIRouter(prefix="/api/professions", tags=["professions"])


@router.get("")
async def get_professions():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (p:Profession)-[:BELONGS_TO]->(c:Category)
                RETURN p.name AS profession_name, c.name AS category_name, p.id AS id
                ORDER BY toLower(p.name)
                """
            )
            professions = []
            for record in result:
                image_id = record["id"]
                static_path = "static/images"  # Путь к папке с изображениями
                
                # Проверяем существование файла с разными расширениями
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"
                
                for ext in extensions:
                    if os.path.exists(f"{static_path}/{image_id}{ext}"):
                        image_url = f"http://localhost:8000/static/images/{image_id}{ext}"
                        break
                
                professions.append({
                    "profession": record["profession_name"],
                    "category": record["category_name"],
                    "image": image_url
                })
            
            return professions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{name}")
async def get_profession(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (p:Profession)
                WHERE p.name = $profession_name
                OPTIONAL MATCH (p)-[:REQUIRES]->(s:Skill)
                OPTIONAL MATCH (p)-[:USES_TECH]->(t:Technology)
                OPTIONAL MATCH (p)-[:USES_TOOL]->(tool:Tool)
                OPTIONAL MATCH (p)-[:BELONGS_TO]->(c:Category)
                RETURN p.name AS profession_name, 
                       p.id AS id,
                       c.name AS category_name,
                       collect(DISTINCT s.name) AS skills,
                       collect(DISTINCT t.name) AS technologies,
                       collect(DISTINCT tool.name) AS tools
                """,
                {"profession_name": name}
            )
            
            record = result.single()
            if not record:
                raise HTTPException(status_code=404, detail="Profession not found")
            
            # Определяем расширение изображения
            image_id = record["id"]
            static_path = "static/images"  # Путь относительно корня проекта
            extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
            image_url = "http://localhost:8000/static/images/in_progress.jpg"
            
            for ext in extensions:
                if os.path.exists(f"{static_path}/{image_id}{ext}"):
                    image_url = f"http://localhost:8000/static/images/{image_id}{ext}"
                    break
            
            return {
                "profession": record["profession_name"],
                "category": record["category_name"],
                "skills": record["skills"],
                "technologies": record["technologies"],
                "tools": record["tools"],
                "image": image_url 
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/filter/categories")
async def get_professions_sorted_by_categories():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (p:Profession)-[:BELONGS_TO]->(c:Category)
                RETURN p.name AS profession_name, c.name AS category_name, p.id AS id
                ORDER BY toLower(category_name), toLower(p.name)
                """
            )

            professions = []
            for record in result:
                image_id = record["id"]
                static_path = "static/images"  # Путь относительно корня проекта
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"
                
                # Проверяем существование файла с разными расширениями
                for ext in extensions:
                    if os.path.exists(f"{static_path}/{image_id}{ext}"):
                        image_url = f"http://localhost:8000/static/images/{image_id}{ext}"
                        break

                professions.append({
                    "profession": record["profession_name"],
                    "category": record["category_name"],
                    "image": image_url
                })

            return professions

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filter/categories/{name}")
async def get_professions_filtered_by_category(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (c:Category)<-[:BELONGS_TO]-(p:Profession)
                WHERE c.name = $name
                RETURN p.name AS profession_name, c.name AS category_name, p.id AS id
                ORDER BY toLower(p.name)
                """,
                {"name": name}
            )

            professions = []
            for record in result:
                image_id = record["id"]
                static_path = "static/images"  # Путь к папке с изображениями
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                # Проверяем существование файла с разными расширениями
                for ext in extensions:
                    file_path = os.path.join(static_path, f"{image_id}{ext}")
                    if os.path.exists(file_path):
                        image_url = f"http://localhost:8000/static/images/{image_id}{ext}"
                        break

                professions.append({
                    "profession": record["profession_name"],
                    "category": record["category_name"],
                    "image": image_url
                })

            if not professions:  # Если категория не содержит профессий
                raise HTTPException(
                    status_code=404,
                    detail=f"No professions found for category '{name}'"
                )

            return professions

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filter/skills/{name}")
async def get_professions_filtered_by_skill(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (s:Skill)<-[:REQUIRES]-(p:Profession)-[:BELONGS_TO]->(c:Category)
                WHERE s.name = $name
                RETURN DISTINCT p.name AS profession_name, c.name AS category_name, p.id AS id
                ORDER BY toLower(p.name)
                """,
                {"name": name}
            )

            professions = []
            for record in result:
                image_id = record["id"]
                static_path = "static/images"  # Путь к папке с изображениями
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                # Проверяем существование файла с разными расширениями
                for ext in extensions:
                    file_path = os.path.join(static_path, f"{image_id}{ext}")
                    if os.path.exists(file_path):
                        image_url = f"http://localhost:8000/static/images/{image_id}{ext}"
                        break

                professions.append({
                    "profession": record["profession_name"],
                    "category": record["category_name"],
                    "image": image_url 
                })

            if not professions:
                raise HTTPException(
                    status_code=404,
                    detail=f"No professions found requiring skill '{name}'"
                )

            return professions

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/filter/technologies/{name}")
async def get_professions_filtered_by_technology(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Technology)<-[:USES_TECH]-(p:Profession)-[:BELONGS_TO]->(c:Category)
                WHERE t.name = $name
                RETURN DISTINCT p.name AS profession_name, c.name AS category_name, p.id AS id
                ORDER BY toLower(p.name)
                """,
                {"name": name}
            )

            professions = []
            for record in result:
                image_id = record["id"]
                static_path = "static/images"
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                # Проверка существования файла изображения
                for ext in extensions:
                    file_path = os.path.join(static_path, f"{image_id}{ext}")
                    if os.path.exists(file_path):
                        image_url = f"http://localhost:8000/static/images/{image_id}{ext}"
                        break

                professions.append({
                    "profession": record["profession_name"],
                    "category": record["category_name"],
                    "image": image_url
                })

            if not professions:
                raise HTTPException(
                    status_code=404,
                    detail=f"No professions found using technology '{name}'"
                )

            return professions

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch professions: {str(e)}"
        )


@router.get("/filter/tools/{name}")
async def get_professions_filtered_by_tool(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (tool:Tool)<-[:USES_TOOL]-(p:Profession)-[:BELONGS_TO]->(c:Category)
                WHERE tool.name = $name
                RETURN DISTINCT p.name AS profession_name, 
                       c.name AS category_name, 
                       p.id AS id
                ORDER BY toLower(p.name)
                """,
                {"name": name}
            )

            professions = []
            for record in result:
                image_id = record["id"]
                static_dir = "static/images"
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                # Проверяем существование файла изображения
                for ext in extensions:
                    img_path = os.path.join(os.getcwd(), static_dir, f"{image_id}{ext}")
                    if os.path.isfile(img_path):
                        image_url = f"http://localhost:8000/static/images/{image_id}{ext}"
                        break

                professions.append({
                    "profession": record["profession_name"],
                    "category": record["category_name"],
                    "image": image_url
                })

            if not professions:
                raise HTTPException(
                    status_code=404,
                    detail=f"No professions found using tool '{name}'"
                )

            return professions

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving professions: {str(e)}"
        )



@router.get("/search/by_name/{search_term}")
async def search_professions_by_name(search_term: str = ""):
    try:
        search_term = search_term.strip()
        if not search_term:
            raise HTTPException(
                status_code=400,
                detail="Search term cannot be empty"
            )

        with driver.session() as session:
            result = session.run(
                """
                MATCH (p:Profession)-[:BELONGS_TO]->(c:Category)
                WHERE toLower(p.name) CONTAINS toLower($search_term)
                RETURN p.name AS profession_name, c.name AS category_name, p.id AS id
                ORDER BY toLower(p.name)
                """,
                {"search_term": search_term}
            )

            professions = []
            for record in result:
                image_id = record["id"]
                static_path = os.path.join("static", "images")
                extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
                image_url = "http://localhost:8000/static/images/in_progress.jpg"

                # Проверка существования файла изображения
                for ext in extensions:
                    file_path = os.path.join(static_path, f"{image_id}{ext}")
                    if os.path.exists(file_path):
                        image_url = f"/static/images/{image_id}{ext}"
                        break

                professions.append({
                    "profession": record["profession_name"],
                    "category": record["category_name"],
                    "image": image_url
                })

            return professions

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )
