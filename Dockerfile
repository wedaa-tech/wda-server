FROM node:18.13.0

# Install Git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Create working dir
WORKDIR /usr/src/app

# Install Yeoman globally
RUN npm install -g yo@4.3.1

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Clone and install generator-tf-wdi
RUN git clone https://github.com/wedaa-tech/generator-tf-wdi.git && \
    cd generator-tf-wdi && npm install && npm link

# Clone and install generator-jhipster
RUN git clone https://github.com/wedaa-tech/generator-jhipster.git && \
    cd generator-jhipster && npm install && npm link

# Clone and install all JHipster blueprints while ignoring peer dependency conflicts using --legacy-peer-deps
RUN git clone https://github.com/wedaa-tech/jhipster-blueprints.git && \
    cd jhipster-blueprints/generator-jhipster-gomicro && npm install --legacy-peer-deps && npm link && \
    cd ../generator-jhipster-react && npm install --legacy-peer-deps && npm link && \
    cd ../generator-jhipster-angular && npm install --legacy-peer-deps && npm link && \
    cd ../docusaurus-generator && npm install --legacy-peer-deps && npm link && \
    cd ../generator-jhipster-fastapi && npm install --legacy-peer-deps && npm link


# Add user and change ownership of the app directory
RUN groupadd -r wedaa && useradd -r -g wedaa -s /bin/bash -m wedaa && \
    chown -R wedaa:wedaa /usr/src/app

# Add this after creating the user and before switching users
RUN mkdir -p /usr/src/app/code_archives && \
    chown -R wedaa:wedaa /usr/src/app/code_archives

# Switch to the new user
USER wedaa

# Set environment variables
ENV NEW_RELIC_NO_CONFIG_FILE=true \
    NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true \
    NEW_RELIC_LOG=stdout

# Expose the port on which the app will listen
EXPOSE 3001

# Start the application
CMD [ "node", "server.js" ]
