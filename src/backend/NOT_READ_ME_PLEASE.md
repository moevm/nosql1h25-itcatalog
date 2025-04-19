### Список возможных запросов к базе данных

#### a. Запросы для отображения списков профессий, навыков, технологий и инструментов

1) professions
    - список: `@app.get("/api/professions")` </br>
`http GET http://localhost:8000/api/professions`
    - карточка: `@app.get("/api/professions/{id}")` </br>
`http GET http://localhost:8000/api/professions/efcafab0-d000-1000-a100-000000000001`
    - сортировка и фильтрация:
        * `@app.get("/api/professions/filter/categories")` </br>
`http GET http://localhost:8000/api/professions/filter/categories`
        * `@app.get("/api/professions/filter/categories/{id}")` </br>
`http GET http://localhost:8000/api/professions/filter/categories/efcafab0-d000-1000-b100-000000000001`
        * `@app.get("/api/professions/filter/skills")` </br>
`http GET http://localhost:8000/api/professions/filter/skills`
        * `@app.get("/api/professions/filter/skills/{id}")` </br>
`http GET http://localhost:8000/api/professions/filter/skills/efcafab0-d000-1000-a200-000000000001`
        * `@app.get("/api/professions/filter/technologies")` </br>
`http GET http://localhost:8000/api/professions/filter/technologies`
        * `@app.get("/api/professions/filter/technologies/{id}")` </br>
`http GET http://localhost:8000/api/professions/filter/technologies/efcafab0-d000-1000-a300-00000000001`
        * `@app.get("/api/professions/filter/tools")` </br>
`http GET http://localhost:8000/api/professions/filter/tools`
        * `@app.get("/api/professions/filter/tools/{id}")` </br>
`http GET http://localhost:8000/api/professions/filter/tools/efcafab0-d000-1000-a400-00000000001`
2) skills
    - список: `@app.get("/api/skills")` </br>
`http GET http://localhost:8000/api/skills`
    - карточка: `@app.get("/api/skills/{id}")` </br>
`http GET http://localhost:8000/api/skills/efcafab0-d000-1000-a200-000000000001`
    - сортировка и фильтрация:
        * `@app.get("/api/skills/filter/skillgroups")` </br>
`http GET http://localhost:8000/api/skills/filter/skillgroups`
        * `@app.get("/api/skills/filter/skillgroups/{id}")` </br>
`http GET http://localhost:8000/api/skills/filter/skillgroups/efcafab0-d000-1000-b200-000000000001`
3) technologies
    - список: `@app.get("/api/technologies")` </br>
`http GET http://localhost:8000/api/technologies`
    - карточка: `@app.get("/api/technologies/{id}")` </br>
`http GET http://localhost:8000/api/technologies/efcafab0-d000-1000-a300-00000000001`
    - сортировка и фильтрация:
        * `@app.get("/api/technologies/filter/technologygroups")` </br>
`http GET http://localhost:8000/api/technologies/filter/technologygroups`
        * `@app.get("/api/technologies/filter/technologygroups/{id}")` </br>
`http GET http://localhost:8000/api/technologies/filter/technologygroups/efcafab0-d000-1000-b300-000000000001`
4) tools
    - список: `@app.get("/api/tools")` </br>
`http GET http://localhost:8000/api/tools`
    - карточка: `@app.get("/api/tools/{id}")` </br>
`http GET http://localhost:8000/api/tools/efcafab0-d000-1000-a400-00000000001`
    - сортировка и фильтрация:
        * `@app.get("/api/tools/filter/toolgroups")` </br>
`http GET http://localhost:8000/api/tools/filter/toolgroups`
        * `@app.get("/api/tools/filter/toolgroups/{id}")` </br>
`http GET http://localhost:8000/api/tools/filter/toolgroups/efcafab0-d000-1000-b400-000000000001`

#### b. Запросы для отображения списков категорий, групп навыков, групп технологий и групп инструментов

`@app.get("/api/groups/{group_type}")`
1) `http GET http://localhost:8000/api/groups/categories`
2) `http GET http://localhost:8000/api/groups/skillgroups`
3) `http GET http://localhost:8000/api/groups/technologygroups`
4) `http GET http://localhost:8000/api/groups/toolgroups`

#### Импорт и экспорт

1) `@app.post("/api/import")` </br>
`http GET http://localhost:8000/api/import`
2) `@app.get("/api/export")` </br>
`http GET http://localhost:8000/api/export`
