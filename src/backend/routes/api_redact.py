from fastapi import APIRouter, HTTPException, UploadFile, File
from database import driver
from utils import check_node_exists, create_node, create_relationship,update_node, delete_relationship
import json

router = APIRouter(prefix="/api", tags=["redact"])

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
        
        
@router.put("/edit")
async def edit_node(file: UploadFile = File(...)):
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
        return { "status": "node edited" }

    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Invalid JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
