from fastapi import APIRouter, HTTPException, UploadFile, File
from database import driver
from utils import check_node_exists, create_node, create_relationship,update_node
import json

router = APIRouter(prefix="/api", tags=["redact"])

@router.get("/get_id/{name}")
async def get_id(name: str):
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (n {name: $name})
                RETURN n.id AS id
                LIMIT 1
                """,
                {"name": name}
            )
            record = result.single()
            if not record:
                raise HTTPException(
                    status_code=404,
                    detail=f"Node with name '{name}' not found"
                )
            return {"id": record["id"]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/add")
async def add_node(file: UploadFile = File(...)):
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

        return { "status": "node added" }

    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Invalid JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
        
@router.post("/edit")
async def edit_node(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        data = json.loads(contents)

        with driver.session() as session:
            for node in data.get("nodes", []):
                new_label = node.get("label")
                new_properties = node.get("properties", {})
                name = new_properties.get("name")

                if not name:
                    continue

                exists = session.execute_read(
                    check_node_exists, 
                    new_label,
                    name
                )
                if exists:
                    session.execute_write(
                        update_node,
                        name,
                        new_label,
                        new_properties
                    )

            #for rel in data.get("relationships", []):
            #    session.execute_write(
            #        create_relationship,
            #        rel["startNode"],
            #        rel["endNode"],
            #        rel["type"]
            #    )

        return { "status": "node edited" }

    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Invalid JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
