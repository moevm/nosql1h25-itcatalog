from fastapi import APIRouter, HTTPException
from database import driver

router = APIRouter(prefix="/api/graph", tags=["graph"])

@router.get("")
async def get_graph_data():
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (n)-[r]->(m)
                RETURN n, r, m
                """
            )
            nodes = []
            relationships = []
            node_ids = set()

            for record in result:
                node_a = record["n"]
                node_b = record["m"]
                relationship = record["r"]

                if node_a.id not in node_ids:
                    node_ids.add(node_a.id)
                    nodes.append({
                        "id": node_a.id,
                        "label": next(iter(node_a.labels), "Unknown"),
                        "properties": dict(node_a)
                    })

                if node_b.id not in node_ids:
                    node_ids.add(node_b.id)
                    nodes.append({
                        "id": node_b.id,
                        "label": next(iter(node_b.labels), "Unknown"),
                        "properties": dict(node_b)
                    })

                relationships.append({
                    "source": node_a.id,
                    "target": node_b.id,
                    "type": relationship.type,
                    "properties": dict(relationship)
                })

            return {
                "nodes": nodes,
                "links": relationships
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
