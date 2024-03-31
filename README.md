# wda-server

Backend Engine for WeDAA!

## Dependencies

This backend service needs below components to function properly:

-   MongoDB
-   Keycloak

Run Keycloak as docker instance:

```
npm run docker:keycloak:up
```

Run MongoDB as docker instance:

```
npm run docker:db:up
```

## How to run in development ?

```
node server.js
```

or

```
npm start
```
