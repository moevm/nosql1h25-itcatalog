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
    
def update_node(tx, old_name, new_name, new_label, new_properties):
    query = (
        "MATCH (n) "
        "WHERE n.name=$old_name "
        "SET n.label = $new_label, n.name = $new_name, n += $new_properties "
        "RETURN n "
    )
    tx.run(query, old_name=old_name, new_name=new_name, new_label=new_label, new_properties=new_properties)

def delete_relationship(tx, start_node_id, end_node_id, rel_type):
    query = (
        "MATCH (a)-[r:%s]->(b) "
        "WHERE a.id = $start_node_id AND b.id = $end_node_id "
        "DELETE r" % rel_type
    )
    tx.run(query, start_node_id=start_node_id, end_node_id=end_node_id)

