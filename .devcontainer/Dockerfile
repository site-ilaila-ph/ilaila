FROM mcr.microsoft.com/devcontainers/typescript-node:24

USER root
RUN apt-get update && apt-get install -y curl ripgrep git && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt/microsoft/powershell/7 \
    && curl -L "https://github.com/PowerShell/PowerShell/releases/download/v7.6.5/powershell-7.6.5-linux-x64.tar.gz" \
    | tar -xz -C /opt/microsoft/powershell/7 \
    && ln -s /opt/microsoft/powershell/7/pwsh /usr/bin/pwsh

RUN mkdir -p /workspace \
    && chown -R node:node /workspace \
    && mkdir -p /setup \
    && chown -R node:node /setup
    
USER node