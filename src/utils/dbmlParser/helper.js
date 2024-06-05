const { Parser } = require('@dbml/core');
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
 * Parses a DBML script to extract and return a list of table names.
 *
 * This function parses the provided DBML script using the Parser and extracts table names from the parsed
 * schema tables. The table names are returned in snake_case format[Default format of dbml script].
 *
 * @param {string} dbml - The DBML script to be parsed.
 * @returns {string[]} An array of table names in snake_case format.
 * @throws Will throw an error if the DBML parsing fails, including a detailed error message.
 */
exports.getTableNames = dbml => {
    try {
        const database = new Parser().parse(dbml, 'dbml');
        console.log('DBML parsing successful');
        var tables = [];
        database.schemas.forEach(schema => {
            schema.tables.forEach(table => {
                tables.push(table.name);
            });
        });
        return tables;
    } catch (error) {
        console.error('Error parsing DBML:', error);
        const errorMessage = dbmlParseError(error);
        throw new Error(errorMessage);
    }
};


