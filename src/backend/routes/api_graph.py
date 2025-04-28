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

            for record in result:
                node_a = record["n"]
                node_b = record["m"]
                relationship = record["r"]

                if node_a not in nodes:
                    nodes.append({
                        "id": node_a.id,
                        "label": node_a.labels[0],
                        "properties": dict(node_a)
                    })
                if node_b not in nodes:
                    nodes.append({
                        "id": node_b.id,
                        "label": node_b.labels[0],
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
                "relationships": relationships
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
