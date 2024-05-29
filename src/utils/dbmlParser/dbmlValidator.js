const { Parser } = require('@dbml/core');
const { toCamelCase } = require('./dbmlToJson');
const { dbmlParseError } = require('./error');

/**
 * Validates a DBML script by attempting to parse it.
 *
 * This function attempts to parse the provided DBML script using the Parser.
 *
 * @param {string} dbml - The DBML script to be validated.
 * @returns {boolean} Returns true if the DBML script is valid and was parsed successfully, otherwise returns false.
 */
exports.validateDbmlScript = dbml => {
    try {
        new Parser().parse(dbml, 'dbml');
        console.log('DBML parsing successful');
        return true;
    } catch (error) {
        console.error('Error parsing DBML:', error);
        return false;
    }
};

/**
 * Parses a DBML script to extract and return a list of entity names.
 *
 * This function parses the provided DBML script using the Parser and extracts entity names from the parsed
 * schema tables. The entity names are returned in camel case format.
 *
 * @param {string} dbml - The DBML script to be parsed.
 * @returns {string[]} An array of entity names in camel case format.
 * @throws Will throw an error if the DBML parsing fails, including a detailed error message.
 */
exports.getEntityNames = dbml => {
    try {
        const database = new Parser().parse(dbml, 'dbml');
        console.log('DBML parsing successful');
        var entities = [];
        database.schemas.forEach(schema => {
            schema.tables.forEach(table => {
                const capitalizedName = toCamelCase(table.name.charAt(0).toUpperCase() + table.name.slice(1));
                entities.push(capitalizedName);
            });
        });
        return entities;
    } catch (error) {
        console.error('Error parsing DBML:', error);
        const errorMessage = dbmlParseError(error);
        throw new Error(errorMessage);
    }
};
