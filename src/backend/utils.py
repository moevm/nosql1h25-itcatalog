from neo4j import GraphDatabase

def delete_nodes(driver):
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")

def create_node(tx, label, properties):
    query = f"CREATE (n:{label} $properties)"
    tx.run(query, properties=properties)

def create_relationship(tx, start_node_id, end_node_id, relationship_type):
    query = """
    MATCH (a), (b)
    WHERE a.id = $start_node_id AND b.id = $end_node_id
    CREATE (a)-[r:%s]->(b)
    RETURN r
    """ % relationship_type
    tx.run(query, start_node_id=start_node_id, end_node_id=end_node_id)
