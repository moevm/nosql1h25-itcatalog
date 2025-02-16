from neo4j import GraphDatabase

URI = "neo4j+ssc://70519b04.databases.neo4j.io"
USERNAME = "neo4j"
PASSWORD = 

# Подключение к базе
driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))

# Функция для создания узла
def create_person(tx, name):
    tx.run("CREATE (:Person {name: $name})", name=name)

# Функция для чтения данных
def get_people(tx):
    result = tx.run("MATCH (p:Person) RETURN p.name AS name")
    return [record["name"] for record in result]

# Запись данных в базу
with driver.session() as session:
    session.execute_write(create_person, "Alice")
    print("Данные записаны!")

# Чтение данных из базы
with driver.session() as session:
    people = session.execute_read(get_people)
    print("Данные в базе:", people)
