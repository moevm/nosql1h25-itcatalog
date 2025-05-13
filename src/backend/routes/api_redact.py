from fastapi import APIRouter, HTTPException, UploadFile, File
from datetime import datetime
from database import driver
from utils import check_node_exists, create_node, create_relationship,update_node, delete_relationship
from urllib.parse import unquote
import json
import os

router = APIRouter(prefix="/api", tags=["redact"])
IMAGE_DIR = "/app/static/images"
os.makedirs(IMAGE_DIR, exist_ok=True)

@router.get("/get_id")
async def get_id(name: str):  
    try:
        decoded_name = unquote(name)
        
        with driver.session() as session:
            result = session.run(
                """
                MATCH (n {name: $name})
                RETURN n.id AS id
                LIMIT 1
                """,
                {"name": decoded_name}
            )
            record = result.single()
            if not record:
                raise HTTPException(status_code=404, detail="Node not found")
            return {"id": record["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/add")
async def add_node(file: UploadFile = File(...),
                   image: UploadFile = File(None, description="Optional image file")):
    try:
        contents = await file.read()
        data = json.loads(contents)

        with driver.session() as session:
            for node in data.get("nodes", []):
                label = node.get("label")
                properties = node.get("properties", {})
                name = properties.get("name")

                if not name:
                    continue

                exists = session.execute_read(
                    check_node_exists, 
                    label,
                    name
                )
                if not exists:
                    properties["time"] = datetime.now().isoformat()
                    session.execute_write(
                        create_node,
                        label,
                        properties
                    )

            for rel in data.get("relationships", []):
                session.execute_write(
                    create_relationship,
                    rel["startNode"],
                    rel["endNode"],
                    rel["type"]
                )

        target_id = properties.get("id")
            
        if not target_id:
            raise HTTPException(
                status_code=422,
                detail=f"Node with ID {target_id} not found"
            )

        file_ext = image.filename.split(".")[-1] if "." in image.filename else ""
        filename = f"{target_id}.{file_ext}" if file_ext else str(target_id)
        file_path = os.path.join(IMAGE_DIR, filename)
            
        contents = await image.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        return { "status": "node added" }

    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Invalid JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
        
@router.put("/edit")
async def edit_node(file: UploadFile = File(...),
                    image: UploadFile = File(None, description="Optional image file")):
    try:
        contents = await file.read()
        data = json.loads(contents)

        with driver.session() as session:
            for node in data.get("nodes", []):
                name=node.get("old_name")
                new_label = node.get("label")
                new_properties = node.get("properties", {})
                new_name = new_properties.get("name")

                if not name:
                    continue
                new_properties["time"] = datetime.now().isoformat()
                session.execute_write(
                        update_node,
                        name,
                        new_name,
                        new_label,
                        new_properties
                    )

            for rel_group in data.get("relationships", []):
                for rel in rel_group.get("add_rel", []):
                    session.execute_write(
                        create_relationship, 
                        rel["startNode"],
                        rel["endNode"],
                        rel["type"]
                    )

                for rel in rel_group.get("del_rel", []):
                    session.execute_write(
                        delete_relationship,  
                        rel["startNode"],
                        rel["endNode"],
                        rel["type"]
                    )
                    
        if image:
            target_id = new_properties.get("id")
            
            if not target_id:
                raise HTTPException(
                    status_code=422,
                    detail=f"Node with ID {target_id} not found"
                )

            # Удаляем старые файлы
            for filename in os.listdir(IMAGE_DIR):
                if filename.startswith(str(target_id)):
                    os.remove(os.path.join(IMAGE_DIR, filename))

            # Сохраняем новое изображение
            file_ext = image.filename.split(".")[-1] if "." in image.filename else ""
            filename = f"{target_id}.{file_ext}" if file_ext else str(target_id)
            file_path = os.path.join(IMAGE_DIR, filename)
            
            contents = await image.read()
            with open(file_path, "wb") as f:
                f.write(contents)
        return { "status": "node edited" }

    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Invalid JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
