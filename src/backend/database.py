from neo4j import GraphDatabase
import os
from contextlib import asynccontextmanager

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

@asynccontextmanager
async def lifespan(app):
    try:
        with driver.session() as session:
            session.run("RETURN 1")
        print("Successfully connected to Neo4j")
    except Exception as e:
        print(f"Failed to connect to Neo4j: {e}")
        raise
    yield
    driver.close()

def check_database_empty(driver):
    with driver.session() as session:
        result = session.run("MATCH (n) RETURN count(n) AS count LIMIT 1")
        return result.single()["count"] == 0
