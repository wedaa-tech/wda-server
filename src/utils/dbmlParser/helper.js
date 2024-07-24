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

/**
 * Returns the duplicate table names in snake_case format.
 *
 * @param {Array} applications - The array of application objects.
 * @returns {Array<string>} - An array of duplicate table names in snake_case format.
 * @throws {Error} - Throws an error if there is an issue parsing DBML.
 */
exports.getDuplicateTableNames = applications => {
    try {
        const applicationCount = Object.keys(applications).length;
        const tableNames = {};
        const duplicateTables = [];

        for (let i = 0; i < applicationCount; i++) {
            // loose equality, check for null and undefined.
            if (applications[i].clientFramework == null && applications[i].dbmlData != null && applications[i].dbmlData !== '') {
                const database = new Parser().parse(applications[i].dbmlData, 'dbml');
                database.schemas.forEach(schema => {
                    schema.tables.forEach(table => {
                        if (tableNames[table.name]) {
                            tableNames[table.name] += 1;
                        } else {
                            tableNames[table.name] = 1;
                        }
                    });
                });
            }
        }

        for (const [tableName, count] of Object.entries(tableNames)) {
            if (count > 1) {
                duplicateTables.push(tableName);
            }
        }

        return duplicateTables;
    } catch (error) {
        console.error('Error parsing DBML:', error);
        const errorMessage = dbmlParseError(error);
        throw new Error(errorMessage);
    }
};

/**
 * Returns the duplicate enums in snake_case format.
 *
 * @param {Array} applications - The array of application objects.
 * @returns {Array<string>} - An array of duplicate enums in snake_case format.
 * @throws {Error} - Throws an error if there is an issue parsing DBML.
 */
exports.getDuplicateEnums = applications => {
    try {
        const applicationCount = Object.keys(applications).length;
        const enums = {};
        const duplicateEnums = [];

        for (let i = 0; i < applicationCount; i++) {
            // loose equality, check for null and undefined.
            if (applications[i].clientFramework == null && applications[i].dbmlData != null && applications[i].dbmlData !== '') {
                const database = new Parser().parse(applications[i].dbmlData, 'dbml');
                database.schemas.forEach(schema => {
                    schema.enums.forEach(enumeration => {
                        if (enums[enumeration.name]) {
                            enums[enumeration.name] += 1;
                        } else {
                            enums[enumeration.name] = 1;
                        }
                    });
                });
            }
        }

        for (const [enumeration, count] of Object.entries(enums)) {
            if (count > 1) {
                duplicateEnums.push(enumeration);
            }
        }

        return duplicateEnums;
    } catch (error) {
        console.error('Error parsing DBML:', error);
        const errorMessage = dbmlParseError(error);
        throw new Error(errorMessage);
    }

}