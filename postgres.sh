#!/bin/bash

docker run -d \
    --name nextgen-ai-3 \
    -e POSTGRES_USER=admin \
    -e POSTGRES_PASSWORD=w5W8RoPiVpDz43dq \
    -e POSTGRES_DB=nextgen-ai-3 \
    -e POSTGRES_HOST=127.0.0.1 \
    -p 5434:5432 \
    postgres:latest