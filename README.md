# WeDAA-server

Backend Engine for WeDAA!

## Dependencies

This backend service needs below components to function properly:

-   MongoDB
-   Keycloak
-   RabbitMQ

1. Run Keycloak as docker instance:
```
npm run docker:keycloak:up
```

2. Run MongoDB as docker instance:
```
npm run docker:db:up
```

3. Run RabbitMQ as docker instance:
```
npm run docker:rabbitmq:up
```

## How to run in development ?

1. Create a copy of the .env.example file, name it .env
2. Add the API Keys for any 3rd party libraries, for example:

    - FLAGSMITH_API_KEY

3. Start the server
```
node server.js
```
or
```
npm start
```
## How to run using docker compose ?

1. Build Image
```
docker build -t wedaa-server .
```
2. Run docker compose:

    Add the API Keys for any 3rd party libraries, for example:
    - FLAGSMITH_API_KEY
```
docker compose -f app.yml up
```

#### Note:

1. If you are running using docker compose, for keycloak to work, you need to add '127.0.0.1 keycloak' to your hosts file. 