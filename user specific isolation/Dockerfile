FROM node:18-slim

# Configure logging driver
ENV DOCKER_LOG_DRIVER=json-file
ENV DOCKER_LOG_OPT_MAX_SIZE=10m
ENV DOCKER_LOG_OPT_MAX_FILE=3

WORKDIR /usr/src/app

# Add Python and other build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    python3-pip \
    openjdk-17-jdk \
    unzip \
    curl \
    tini \
    && curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip -q awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && ln -s /usr/bin/python3 /usr/bin/python

# Copy package files and install dependencies
COPY package*.json ./
ENV PYTHON=/usr/bin/python3
RUN npm install -g node-gyp && \
    npm ci --only-production --quiet && \
    npm install node-pty@latest --quiet

COPY entrypoint.sh .
COPY . .

RUN chmod +x entrypoint.sh
RUN npm rebuild --quiet

EXPOSE 5000

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["./entrypoint.sh"]

