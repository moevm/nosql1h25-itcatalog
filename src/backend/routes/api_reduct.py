from fastapi import APIRouter, HTTPException, UploadFile, File
from database import driver
from utils import check_node_exists, create_node, create_relationship
import json

router = APIRouter(prefix="/api", tags=["reduct"])

@router.post("/add")
async def add_node(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        data = json.loads(contents)

        with driver.session() as session:
            for node in data["nodes"]:
                label = node.get("label")
                properties = node.get("properties", {})
                name = properties.get("name")
                if not name:
                    continue  # Пропускаем узлы без имени

                # Проверка существования
                exists = session.execute_read(
                    check_node_exists, 
                    label,
                    name
                )
                if not exists:
                    session.execute_write(
                        create_node,
                        node["label"],
                        properties
                    )
                else:
                    return{"status": "node already exists"}

            # Обработка связей
            for rel in data["relationships"]:
                session.execute_write(
                    create_relationship,
                    rel.get("startNode"),
                    rel.get("endNode"),
                    rel.get("type")
                )
            return {
                "status": "node added",
            }

    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Invalid JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


