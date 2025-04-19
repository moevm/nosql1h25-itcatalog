import json
from fastapi import HTTPException
from fastapi.responses import Response
from docker.backend.main import driver, app


def export_to_json(driver):
    filename = "it_catalog.json"
    result = {"nodes": [], "relationships": []}

    with driver.session() as session:
        # Обрабатываем узлы внутри транзакции
        nodes = session.execute_read(lambda tx:
                                     list(tx.run("MATCH (n) RETURN labels(n) AS labels, properties(n) AS properties")))
        for record in nodes:
            result["nodes"].append({
                "label": record["labels"][0],
                "properties": dict(record["properties"])
            })

        # Обрабатываем связи внутри транзакции
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


@app.get("/api/export")
async def export_data():
    try:
        # Получаем данные из Neo4j
        data = export_to_json(driver)

        # Сериализуем в JSON с правильной кодировкой
        json_data = json.dumps(data, ensure_ascii=False, indent=2)

        return Response(
            content=json_data,
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=export.json"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
