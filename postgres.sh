#!/bin/bash

CONTAINER_NAME="nextgen-ai-3"

# Check if the container exists (either running or stopped)
if [ "$(docker ps -a -q -f name=^/${CONTAINER_NAME}$)" ]; then

	# Check if the container is currently running
	if [ "$(docker ps -q -f name=^/${CONTAINER_NAME}$)" ]; then
		echo "✅ Container '${CONTAINER_NAME}' is already running."
	else
		echo "⏳ Container '${CONTAINER_NAME}' exists but is stopped. Starting it now..."
		docker start ${CONTAINER_NAME}
		echo "✅ Container started."
	fi

else
	echo "🚀 Container '${CONTAINER_NAME}' does not exist. Creating and starting it..."
	docker run -d \
		--name ${CONTAINER_NAME} \
		-e POSTGRES_USER=admin \
		-e POSTGRES_PASSWORD=w5W8RoPiVpDz43dq \
		-e POSTGRES_DB=nextgen-ai-3 \
		-e POSTGRES_HOST=127.0.0.1 \
		-p 5434:5432 \
		postgres:latest
	echo "✅ Container created and running."
fi