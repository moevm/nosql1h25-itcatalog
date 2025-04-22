from fastapi import FastAPI
from database import lifespan
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes import (
    api_professions,
    api_skills,
    api_technologies,
    api_tools,
    api_import,
    api_export,
    api_groups,
    api_reduct
)

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(api_professions.router)
app.include_router(api_skills.router)
app.include_router(api_technologies.router)
app.include_router(api_tools.router)
app.include_router(api_import.router)
app.include_router(api_export.router)
app.include_router(api_groups.router)
app.include_router(api_reduct.router)



    
