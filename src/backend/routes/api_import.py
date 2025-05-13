from fastapi import APIRouter, HTTPException, UploadFile, File
from database import driver, check_database_empty
from utils import check_node_exists, delete_nodes, create_node, create_relationship
from datetime import datetime
import json
import zipfile
import io
import os
import shutil
import tempfile

router = APIRouter(prefix="/api", tags=["import"])



@router.post("/import")
async def import_data(
    file: UploadFile = File(...),
    archive: UploadFile = File(...)
):
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # Обработка архива
            archive_data = await archive.read()
            with zipfile.ZipFile(io.BytesIO(archive_data)) as zip_ref:
                zip_ref.extractall(temp_dir)

            # Получаем список изображений из архива
            image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp'}
            file_list = []
            for root, _, files in os.walk(temp_dir):
                for filename in files:
                    if os.path.splitext(filename)[1].lower() in image_extensions:
                        file_list.append(os.path.join(root, filename))
            # Обработка JSON
            json_data = await file.read()
            data = json.loads(json_data)

            # Проверка структуры данных
            if "nodes" not in data:
                raise HTTPException(status_code=400, detail="JSON must contain 'nodes' array")

            # Проверка соответствия количества файлов и нод
            if len(file_list) != len(data["nodes"]):
                raise HTTPException(
                    status_code=400,
                    detail=f"Number of images ({len(file_list)}) doesn't match nodes count ({len(data['nodes'])})"
                )

            # Очистка и инициализация данных
            if not check_database_empty(driver):
                delete_nodes(driver)
            node_ids=[]
            with driver.session() as session:
                for node in data.get("nodes", []):
                    label = node.get("label")
                    properties = node.get("properties", {})
                    name = properties.get("name")
                    node_id = properties.get("id")
                    node_ids.append(node_id)
 
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


            # Сохранение изображений
            os.makedirs("static/images", exist_ok=True)
            for idx, node_id in enumerate(node_ids):
                src_path = os.path.join(temp_dir, file_list[idx])
                ext = os.path.splitext(file_list[idx])[1].lower()
                dest_path = f"static/images/{node_id}{ext}"
                
                if os.path.exists(src_path):
                    shutil.copy(src_path, dest_path)
                else:
                    print(f"Missing image for node {node_id}")

            return {"message": f"Imported {len(node_ids)} nodes with images"}

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid ZIP archive")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()
        await archive.close()
