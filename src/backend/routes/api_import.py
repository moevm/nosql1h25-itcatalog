from fastapi import APIRouter, HTTPException, UploadFile, File
from database import driver, check_database_empty
from utils import delete_nodes, create_node, create_relationship
import json

router = APIRouter(prefix="/api", tags=["import"])


def load_data_from_json(data):
    with driver.session() as session:
        # Создаем узлы
        for node in data["nodes"]:
            session.execute_write(create_node, node["label"], node["properties"])

        # Создаем связи
        for relationship in data["relationships"]:
            start_node_id = relationship["startNode"]
            end_node_id = relationship["endNode"]
            relationship_type = relationship["type"]
            session.execute_write(create_relationship, start_node_id, end_node_id, relationship_type)


def initialize_data(data):
    load_data_from_json(data)


@router.post("/import")
async def import_data(file: UploadFile = File(...)):
    try:
        # Читаем содержимое файла в память
        contents = await file.read()
        data = json.loads(contents)
        if check_database_empty(driver):
            initialize_data(data)
        else:
            delete_nodes(driver)
            initialize_data(data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    finally:
        await file.close()
