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

## Configure prototyping engine

- Clone [Jhipster Generator](https://github.com/wedaa-tech/generator-jhipster)

- Refer Jhispter internal README.md [README-internal.md](https://github.com/wedaa-tech/generator-jhipster/blob/main/README-internal.md)

- Clone [Jhipster Blueprints](https://github.com/wedaa-tech/jhipster-blueprints)

- Refer Jhipster Blueprint [README.md](https://github.com/wedaa-tech/jhipster-blueprints/blob/main/README.md)

## Run Dependent Services

- Clone [Credit Service](https://github.com/wedaa-tech/credits-service)
- Refer Credit Service [README.md](https://github.com/wedaa-tech/credits-service/blob/main/README.md) to run the service.

- Clone [Notification Service](https://github.com/wedaa-tech/notifications-service)
- Refer Notification Service [README.md](https://github.com/wedaa-tech/notifications-service/blob/main/README.md) to run the service.

- Clone [AI Service](https://github.com/wedaa-tech/ai-core)
- Refer Notification Service [README.md](https://github.com/wedaa-tech/ai-core/blob/main/README.md) to run the service.

**NOTE**: Running credit service is mandatory, Running notification and AI services can be optional, Run if Needed.

## Run WeDAA server In DEV MODE
1. Create a copy of the .env.example file, name it .env
2. Add the API Keys for any 3rd party libraries, for example:

    - FLAGSMITH_API_KEY
3. Add the Aws S3 credentials, for example:
    - AWS_ACCESS_KEY_ID
    - AWS_SECRET_ACCESS_KEY

4. Start the server
```
node server.js
```
or
```
npm start
```

## Running entrie application using docker compose

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