FROM node:18.13.0

# create working dir
WORKDIR /usr/src/app

# Install Yeoman
RUN npm install -g yo

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .


# Install generator-tf-wdi
RUN cd generator-tf-wdi && npm i && npm link

# Install custom generator-tf-wdi
RUN cd generator-jhipster && npm i && npm link

# Add user
RUN groupadd wdi && useradd wdi -s /bin/bash -m -g wdi

RUN chown -R wdi:wdi /usr/src/app 

USER wdi

# Expose the port on which the app will listen
EXPOSE 3001

# Start the application
CMD [ "node", "server.js" ]