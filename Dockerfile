FROM node:14

RUN apt-get update && apt-get install -y \
    git \
    vim \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
COPY package*.json ./
RUN npm install

EXPOSE 5027

CMD ["tail", "-f", "/dev/null"]


