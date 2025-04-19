#!/bin/sh

# Запуск скрипта инициализации данных
python init_data.py

# Запуск основного приложения
exec gunicorn main:app --bind 0.0.0.0:8000 --workers 4 --worker-class uvicorn.workers.UvicornWorker
