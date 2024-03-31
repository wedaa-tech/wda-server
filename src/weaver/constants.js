const SRC = 'src';
const MAIN = 'main';
const DOMAIN = 'domain';

const SRC_MAIN = `${SRC}/${MAIN}`;
const RESOURCES = `${SRC_MAIN}/resources`;
const JAVA = `${SRC_MAIN}/java`;
const LIQUIBASE_CHANGELOG = `${RESOURCES}/config/liquibase/changelog`;

module.exports = {
    SRC,
    MAIN,
    DOMAIN,
    SRC_MAIN,
    JAVA,
    RESOURCES,
    LIQUIBASE_CHANGELOG,
};
