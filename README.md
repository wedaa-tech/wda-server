# wda-server

Backend Engine for WeDAA!

## Dependencies

This backend service needs below components to function properly:

-   MongoDB
-   Keycloak
-   RabbitMQ

Run Keycloak as docker instance:

```
npm run docker:keycloak:up
```

Run MongoDB as docker instance:

```
npm run docker:db:up
```

Run RabbitMQ as docker instance:

```
npm run docker:rabbitmq:up
```

## How to run in development ?

1. Create a copy of the .env.example file with the name .env [First Time Only]

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
