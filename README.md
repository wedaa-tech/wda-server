# wda-server

Backend Engine for Wedaa!

## Dependencies
Before running the application, you must run the following:
- Database[mongodb]
- keycloak

Run keycloak as docker instance:

```
npm run docker:keycloak:up
```

Run mongodb as docker instance:
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
