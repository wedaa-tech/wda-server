require('dotenv').config()

var keycloakConfig = {
    clientId: 'wda',
    bearerOnly: true,
    serverUrl: process.env.KC_HOST,
    realm: 'wda'
};

module.exports = {
    keycloakConfig
};