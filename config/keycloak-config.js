require('dotenv').config()

var keycloakConfig = {
    clientId: 'wda',
    bearerOnly: true,
    serverUrl: 'http://'+process.env.KC_HOST+':'+process.env.KC_HOST_PORT,
    realm: 'wda'
};

module.exports = {
    keycloakConfig
};