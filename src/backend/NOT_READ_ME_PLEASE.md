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
        * `@app.get("/api/professions/filter/categories/{name}")` </br>
`http GET http://localhost:8000/api/professions/filter/categories/Аналитика`
        * `@app.get("/api/professions/filter/skills/{name}")` </br>
`http GET http://localhost:8000/api/professions/filter/skills/"Навык взаимодействия с заказчиками"`
        * `@app.get("/api/professions/filter/technologies/{name}")` </br>
`http GET http://localhost:8000/api/professions/filter/technologies/BPMN`
        * `@app.get("/api/professions/filter/tools/{name}")` </br>
`http GET http://localhost:8000/api/professions/filter/tools/"Microsoft Word"`
    - поиск: `@app.get("/api/professions/search/{search_term}")` </br>
`http GET http://localhost:8000/api/professions/search/Бизнес-аналитик`
 
2) skills
    - список: `@app.get("/api/skills")` </br>
`http GET http://localhost:8000/api/skills`
    - карточка: `@app.get("/api/skills/{id}")` </br>
`http GET http://localhost:8000/api/skills/efcafab0-d000-1000-a200-000000000001`
    - сортировка и фильтрация:
        * `@app.get("/api/skills/filter/skillgroups")` </br>
`http GET http://localhost:8000/api/skills/filter/skillgroups`
        * `@app.get("/api/skills/filter/skillgroups/{name}")` </br>
`http GET http://localhost:8000/api/skills/filter/skillgroups/"Hard skills"`
    - поиск: `@app.get("/api/skills/search/{search_term}")` </br>
`http GET http://localhost:8000/api/skills/search/"Навык взаимодействия с заказчиками"`

3) technologies
    - список: `@app.get("/api/technologies")` </br>
`http GET http://localhost:8000/api/technologies`
    - карточка: `@app.get("/api/technologies/{id}")` </br>
`http GET http://localhost:8000/api/technologies/efcafab0-d000-1000-a300-00000000001`
    - сортировка и фильтрация:
        * `@app.get("/api/technologies/filter/technologygroups")` </br>
`http GET http://localhost:8000/api/technologies/filter/technologygroups`
        * `@app.get("/api/technologies/filter/technologygroups/{name}")` </br>
`http GET http://localhost:8000/api/technologies/filter/technologygroups/"Нотации для моделирования процессов"`
    - поиск: `@app.get("/api/technologies/search/{search_term}")` </br>
`http GET http://localhost:8000/api/technologies/search/BPMN`
`http GET http://localhost:8000/api/technologies/search/Стандарт`

4) tools
    - список: `@app.get("/api/tools")` </br>
`http GET http://localhost:8000/api/tools`
    - карточка: `@app.get("/api/tools/{id}")` </br>
`http GET http://localhost:8000/api/tools/efcafab0-d000-1000-a400-00000000001`
    - сортировка и фильтрация:
        * `@app.get("/api/tools/filter/toolgroups")` </br>
`http GET http://localhost:8000/api/tools/filter/toolgroups`
        * `@app.get("/api/tools/filter/toolgroups/{name}")` </br>
`http GET http://localhost:8000/api/tools/filter/toolgroups/"Работа с документами"`
    - поиск: `@app.get("/api/tools/search/{search_term}")` </br>
`http GET http://localhost:8000/api/tools/search/"Microsoft Word"`
`http GET http://localhost:8000/api/tools/search/"Текстовый редактор"`

#### b. Запросы для отображения списков категорий, групп навыков, групп технологий и групп инструментов

`@app.get("/api/groups/{group_type}")`
1) `http GET http://localhost:8000/api/groups/categories`
    - поиск: `@app.get("/api/groups/categories/search/{search_term}")` </br>
`http GET http://localhost:8000/api/groups/categories/search/Аналитика`
`http GET http://localhost:8000/api/groups/categories/search/Технологии`
3) `http GET http://localhost:8000/api/groups/skillgroups`
    - поиск: `@app.get("/api/groups/categories/search/{search_term}")` </br>
`http GET http://localhost:8000/api/groups/skillgroups/search/"Hard skills"`
`http GET http://localhost:8000/api/groups/skillgroups/search/"Технические компетенции"`
4) `http GET http://localhost:8000/api/groups/technologygroups`
    - поиск: `@app.get("/api/groups/categories/search/{search_term}")` </br>
`http GET http://localhost:8000/api/groups/technologygroups/search/"Нотации для моделирования процессов"`
`http GET http://localhost:8000/api/groups/technologygroups/search/"Стандартизированные языки визуализации"`
5) `http GET http://localhost:8000/api/groups/toolgroups`
    - поиск: `@app.get("/api/groups/categories/search/{search_term}")` </br>
`http GET http://localhost:8000/api/groups/toolgroups/search/"Работа с документами"`
`http GET http://localhost:8000/api/groups/toolgroups/search/"Редакторы и платформы"`

#### Универсальные запросы

1) Получение id элемента: `@app.post("/api/get_id/{name}")` </br>
`http GET http://localhost:8000/get_id/"Программист 1С"`
2) Добавление карточки: `@app.post("/api/add")` </br>
`http GET http://localhost:8000/add`
3) Импорт: `@app.post("/api/import")` </br>
`http GET http://localhost:8000/api/import`
4) Экспорт: `@app.get("/api/export")` </br>
`http GET http://localhost:8000/api/export`
