install:
	pip install -e ".[dev]"

run:
	uvicorn app.main:app --reload

test:
	pytest -q

lint:
	ruff check .

format:
	black .

docker-up:
	docker compose up --build