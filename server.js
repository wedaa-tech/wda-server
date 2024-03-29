require('newrelic');
require('dotenv').config();
require('log-timestamp');
const express = require('express');
var timeout = require('connect-timeout'); 
const app = express();
const cors = require('cors');
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const wdaRoutes = require('./src/routes/private.route.js');
const publicRouter = require("./src/routes/public.route.js");
const db = require('./src/configs/database');
const keycloakConfig = require('./src/configs/keycloak-config.js').keycloakConfig;

// Create a session-store to be used by both the express-session
// middleware and the keycloak middleware.
const memoryStore = new session.MemoryStore();

app.use(timeout(300000));

app.use(
    session({
        secret: 'Zephyr78#*',
        resave: false,
        saveUninitialized: true,
        store: memoryStore,
    }),
);

// call the database connectivity function
db();

app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Middleware to set Access-Control-Expose-Headers globally
app.use((req, res, next) => {
    res.header('Access-Control-Expose-Headers', '*');
    next();
});

// Provide the session store to the Keycloak so that sessions
// can be invalidated from the Keycloak console callback.
//
// Additional configuration is read from keycloak.json file
// installed from the Keycloak web console.

const keycloak = new Keycloak(
    {
        store: memoryStore,
    },
    keycloakConfig,
);

app.use(
    keycloak.middleware({
        logout: '/logout',
        admin: '/',
    }),
);

// Initialise protected express router
var router = express.Router();
// Initialise unprotected express router
var public = express.Router();

// use express router
app.use('/api', keycloak.protect(), router);
app.use(public);

//call wda routing
wdaRoutes(router);
publicRouter(public);

/**
 * Health check api
 */
app.get('/health', (req, res) => {
    return res.status(200).send({ message: 'OK' });
});

app.listen(3001, () => {
    console.log('⚡: Server listening on port 3001');
});

// signal interrupt
process.on('SIGINT', () => {
    process.exit(0);
});

// event listener for the 'uncaughtException' event
process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
});

module.exports = {
    keycloak: keycloak,
};
