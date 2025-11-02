run-dev:
	docker-compose -f docker-compose.yml up --build --force-recreate --no-deps -d
	