from fastapi import FastAPI, HTTPException, File, UploadFile
from neo4j import GraphDatabase
import os
import json
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
from fastapi.responses import FileResponse

load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        with driver.session() as session:
            session.run("RETURN 1") 
        print("Successfully connected to Neo4j")
    except Exception as e:
        print(f"Failed to connect to Neo4j: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to the database")
    
    yield
    
    driver.close()

app = FastAPI(lifespan=lifespan)

# Разрешаем доступ с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

app.mount("/static", StaticFiles(directory="static"), name="static")

def delete_nodes():
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")
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

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(professions.router)
app.include_router(skills.router)
app.include_router(technologies.router)
app.include_router(tools.router)
app.include_router(import_export.router)
app.include_router(filters.router)
    
