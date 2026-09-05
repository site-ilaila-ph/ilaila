FROM mcr.microsoft.com/devcontainers/typescript-node:24

RUN apt-get update && apt-get install -y git postgresql-client && rm -rf /var/lib/apt/lists/*

COPY bootstrap.sh /usr/local/bin/bootstrap.sh
RUN chmod +x /usr/local/bin/bootstrap.sh