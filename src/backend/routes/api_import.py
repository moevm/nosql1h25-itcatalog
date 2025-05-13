from fastapi import APIRouter, HTTPException, UploadFile, File
from database import driver, check_database_empty
from utils import check_node_exists, delete_nodes, create_node, create_relationship
import json
import zipfile
import io
import os
import shutil
import tempfile

router = APIRouter(prefix="/api", tags=["import"])

@router.post("/import")
async def import_data(
    archive: UploadFile = File(..., description="ZIP file containing data.json and images")
):
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
        
            archive_data = await archive.read()
            with zipfile.ZipFile(io.BytesIO(archive_data)) as zip_ref:
                zip_ref.extractall(temp_dir)

            json_candidates = []
            
            for root, _, files in os.walk(temp_dir):
                if "data.json" in files:
                    json_candidates.append(os.path.join(root, "data.json"))
            
            if not json_candidates:
                raise HTTPException(status_code=400, detail="ZIP archive must contain a data.json file")
            if len(json_candidates) > 1:
                raise HTTPException(status_code=400, detail="Multiple data.json files found in ZIP archive")
            
            json_file_path = json_candidates[0]
            

            with open(json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)


            if "nodes" not in data:
                raise HTTPException(status_code=400, detail="JSON must contain 'nodes' array")


            image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'}
            image_files = {}
            
            for root, _, files in os.walk(temp_dir):
                for filename in files:
                    if filename == "data.json":
                        continue
                    ext = os.path.splitext(filename)[1].lower()
                    if ext in image_extensions:
                    
                        file_key = os.path.splitext(filename)[0]
                        image_files[file_key] = os.path.join(root, filename)


            if not check_database_empty(driver):
                delete_nodes(driver)
            
            node_ids = []
            relationship_count = 0
            with driver.session() as session:

                for node in data.get("nodes", []):
                    label = node.get("label")
                    properties = node.get("properties", {})
                    name = properties.get("name")
                    node_id = properties.get("id")
                    
                    if node_id:
                        node_ids.append(node_id)
                    
                    if not name:
                        continue
    
                    exists = session.execute_read(
                        check_node_exists, 
                        label,
                        name
                    )
                    if not exists:
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
                    relationship_count += 1


            os.makedirs("static/images", exist_ok=True)
            saved_images_count = 0
            
            for node_id in node_ids:

                if str(node_id) in image_files:
                    src_path = image_files[str(node_id)]
                    ext = os.path.splitext(src_path)[1].lower()
                    dest_path = f"static/images/{node_id}{ext}"
                    
                    if os.path.exists(src_path):
                        shutil.copy(src_path, dest_path)
                        saved_images_count += 1
            
            return {
                "success": True,
                "message": f"Import completed successfully",
                "count": len(node_ids),
                "relationships": relationship_count,
                "images": saved_images_count
            }

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid ZIP archive")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await archive.close()
