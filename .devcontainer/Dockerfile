FROM mcr.microsoft.com/devcontainers/typescript-node:24

USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        ripgrep \
        git \
    && rm -rf /var/lib/apt/lists/* \

USER node
ENV REMOTE_REPOSITORY_URL="https://github.com/site-ilaila-ph/ilaila.git"
ENV PATH="/workspace/bin:$PATH"
COPY . /setup