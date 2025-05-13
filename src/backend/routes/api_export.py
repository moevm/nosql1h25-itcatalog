from fastapi import APIRouter, HTTPException, UploadFile, File, Response
from database import driver, check_database_empty
from pathlib import Path
from io import BytesIO
import zipfile
import json


router = APIRouter(prefix="/api", tags=["export"])


def export_to_json(driver):
    filename = "it_catalog.json"
    result = {"nodes": [], "relationships": []}

    with driver.session() as session:
        nodes = session.execute_read(lambda tx:
                                     list(tx.run("MATCH (n) RETURN labels(n) AS labels, properties(n) AS properties")))
        for record in nodes:
            props = dict(record["properties"])
            props.pop("time", None)
            
            result["nodes"].append({
                "label": record["labels"][0],
                "properties": props
            })
            

        relationships = session.execute_read(lambda tx:
                                             list(tx.run(
                                                 "MATCH (s)-[r]->(e) RETURN type(r) AS type, s.id AS startNode, e.id AS endNode")))
        for record in relationships:
            result["relationships"].append({
                "type": record["type"],
                "startNode": record["startNode"],
                "endNode": record["endNode"]
            })
    return result


@router.get("/export")
async def export_data():
    try:
        data = export_to_json(driver)
        json_data = json.dumps(data, ensure_ascii=False, indent=2)
        
        images_dir = Path("static/images")
        
        if not images_dir.exists():
            raise HTTPException(status_code=404, detail="Images directory not found")
        
        zip_buffer = BytesIO()
        
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            zip_file.writestr("data.json", json_data)

            for img_path in images_dir.rglob("*"):
                if img_path.is_file():
                    arcname = str(img_path.relative_to(images_dir.parent))
                    zip_file.write(img_path, arcname=arcname)

        zip_buffer.seek(0)

        return Response(
            content=zip_buffer.getvalue(),
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=export.zip"}
        )
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
