import os
import time
import json
from neo4j import GraphDatabase

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

def check_database_empty(driver):
    with driver.session() as session:
        result = session.run(
            "MATCH (n) RETURN count(n) AS count LIMIT 1"
        )
        return result.single()["count"] == 0
        
def create_node(tx, label, properties):
    query = f"CREATE (n:{label} $properties)"
    tx.run(query, properties=properties)


def create_relationship(tx, start_node_id, end_node_id, relationship_type):
    query = f"""
    MATCH (a), (b)
    WHERE a.id = $start_node_id AND b.id = $end_node_id
    CREATE (a)-[r:{relationship_type}]->(b)
    RETURN r
    """
    tx.run(query, start_node_id=start_node_id, end_node_id=end_node_id)


def load_data_from_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:  # Открытие с кодировкой UTF-8
        data = json.load(f)

    with driver.session() as session:
        # Создаем узлы
        for node in data["nodes"]:
            label = node["label"]
            properties = node["properties"]
            session.execute_write(create_node, label, properties)

        # Создаем связи
        for relationship in data["relationships"]:
            start_node_id = relationship["startNode"]
            end_node_id = relationship["endNode"]
            relationship_type = relationship["type"]
            session.execute_write(create_relationship, start_node_id, end_node_id, relationship_type)

def initialize_data(driver):
    load_data_from_json("db.json")

if __name__ == "__main__":
    print("Checking database initialization...")
    
    max_retries = 5
    retry_delay = 10  # seconds
    
    for i in range(max_retries):
        try:
            driver = GraphDatabase.driver(
                NEO4J_URI,
                auth=(NEO4J_USER, NEO4J_PASSWORD)
            )
            driver.verify_connectivity()
            
            if check_database_empty(driver):
                print("Database is empty. Initializing data...")
                initialize_data(driver)
                print("Data initialization completed")
            else:
                print("Database already contains data")
            
            driver.close()
            break
        except Exception as e:
            print(f"Connection attempt {i+1} failed: {str(e)}")
            if i < max_retries - 1:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
    else:
        print("Failed to connect to database after multiple attempts")
