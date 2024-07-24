const { Parser } = require('@dbml/core');
const { dbmlParseError } = require('./error');
const { capitalizeName, toCamelCase } = require('../helper');
const { getDuplicateTableNames, getDuplicateEnums } = require('./helper');

// Function to map dbml field types with the jdl field types
function mapFieldType(type) {
    const typeMapping = {
        //Integer Types:
        int: 'Integer',
        integer: 'Integer',
        smallint: 'Integer',
        bigint: 'Long',

        // String Types:
        char: 'String',
        varchar: 'String',
        text: 'String',
        tinytext: 'String',
        mediumtext: 'String',
        longtext: 'String',

        // Decimal Types:
        decimal: 'Double',
        numeric: 'Double',
        real: 'Double',
        float: 'Float',

        // Binary Types:
        binary: 'Blob',
        varbinary: 'Blob',
        blob: 'Blob',
        tinyblob: 'Blob',
        mediumblob: 'Blob',
        longblob: 'AnyBlob',

        // Date and Time Types:
        timestamp: 'Instant',
        date: 'Instant',
        datetime: 'Instant',
        time: 'Duration',
        year: 'Duration',

        // Boolean Types:
        boolean: 'Boolean',

        // UUID Types:
        uuid: 'UUID',

        // Additional Types:
        json: 'String',

        // Add other type mappings as needed
    };
    return typeMapping[type] || type;
}

// Function to map relationship types based on the relations
function mapRelationshipType(relation1, relation2) {
    const relationshipMap = {
        '**': 'ManyToMany',
        11: 'OneToOne',
        '1*': 'OneToMany',
        '*1': 'ManyToOne',
    };

    return relationshipMap[`${relation1}${relation2}`] || null;
}

/**
 * Parses relationships from a given database object and returns them as formatted JDL strings.
 *
 * This function iterates over schemas and references within the provided database object,
 * determines the relationship type between tables, and formats the relationships into JDL syntax.
 *
 * @param {Object} database - The database object parsed from DBML.
 * @returns {string} A formatted string containing all the relationships in JDL syntax.
 */
exports.parseRelationships = (database, duplicateEntities, suffix) => {
    let relationships = '';

    database.schemas.forEach(schema => {
        schema.refs.forEach(ref => {
            if (ref.endpoints.length === 2) {
                const [endpoint1, endpoint2] = ref.endpoints;
                const relationshipType = mapRelationshipType(endpoint1.relation, endpoint2.relation);

                if (relationshipType) {
                    var endpoint1TableName = capitalizeName(endpoint1.tableName);
                    var endpoint2TableName = capitalizeName(endpoint2.tableName);

                    // [Future Release]: Random suffix can be replaced with logic object in future.
                    if (duplicateEntities.includes(endpoint1.tableName)) {
                        endpoint1TableName = capitalizeName(endpoint1TableName + suffix);
                    }
                    // [Future Release]: Random suffix can be replaced with logic object in future.
                    if (duplicateEntities.includes(endpoint2.tableName)) {
                        endpoint2TableName = capitalizeName(endpoint2TableName + suffix);
                    }

                    relationships += `
relationship ${relationshipType} {
  ${toCamelCase(endpoint1TableName)} to ${toCamelCase(endpoint2TableName)}
}\n`;
                }
            }
        });
    });

    return relationships;
};

/**
 * Prepares enum data from the provided applications.
 *
 * This function processes a list of applications, parsing their DBML data to extract
 * enum definitions and formats them into a string. It also handles duplicate enum names by appending a suffix.
 *
 * @param {Object[]} applications - An array of application objects.
 * @param {string} applications[].clientFramework - The client framework used by the application.
 * @param {string} applications[].dbmlData - The DBML data for the application.
 * @param {string} applications[].suffix - A suffix to be appended to duplicate enum names.
 * @returns {string} - A formatted string containing all the enum definitions.
 * @throws {Error} - Throws an error if there's an issue parsing the DBML data.
 */
exports.prepareEnumData = applications => {
    const applicationCount = Object.keys(applications).length;
    try {
        const duplicateEnums = getDuplicateEnums(applications);
        let enumData = '';

        for (let i = 0; i < applicationCount; i++) {
            // loose equality, check for null and undefined.
            if (applications[i].clientFramework == null && applications[i].dbmlData != null && applications[i].dbmlData !== '') {
                const database = new Parser().parse(applications[i].dbmlData, 'dbml');
                var suffix = applications[i].suffix;
                database.schemas.forEach(schema => {
                    schema.enums.forEach(enumeration => {
                        let capitalizedUniqueEnum = capitalizeName(toCamelCase(enumeration.name));
                        // check for duplicate Enums [snake_case], add suffix to it
                        if (duplicateEnums.includes(enumeration.name)) {
                            capitalizedUniqueEnum = capitalizeName(toCamelCase(enumeration.name + suffix));
                        }
                        const values = enumeration.values.map(value => value.name.toUpperCase());

                        enumData += `
enum ${capitalizedUniqueEnum} {
    ${values.join(',\n    ')}
}\n`;
                    });
                });
            }
        }
        return enumData;
    } catch (error) {
        console.error('Error parsing DBML:', error);
        const errorMessage = dbmlParseError(error);
        throw new Error(errorMessage);
    }
};

/**
 * Prepares entity data from a given list of applications and returns it as formatted JDL strings.
 *
 * This function parses the DBML data of each application, extracts table and field information,
 * formats them into JDL syntax, and includes the relationships between tables.
 *
 * @param {Object[]} applications - An array of application objects containing DBML data.
 * @returns {string} A formatted string containing all the entities and relationships in JDL syntax.
 * @throws Will throw an error if the DBML parsing fails, including a detailed error message.
 */
exports.prepareEntityData = applications => {
    const applicationCount = Object.keys(applications).length;
    let entityData = '';

    const duplicateEntities = getDuplicateTableNames(applications);
    const duplicateEnums = getDuplicateEnums(applications);
    let enumData = this.prepareEnumData(applications);

    entityData += enumData;
    try {
        for (let i = 0; i < applicationCount; i++) {
            // loose equality, check for null and undefined.
            if (applications[i].clientFramework == null && applications[i].dbmlData != null && applications[i].dbmlData !== '') {
                const database = new Parser().parse(applications[i].dbmlData, 'dbml');
                var suffix = applications[i].suffix;

                // Iterate through the schemas and tables to form the entityData
                database.schemas.forEach(schema => {
                    // get the list of Enums for this application
                    let appEnums = [];
                    schema.enums.forEach(enumeration => {
                        appEnums.push(enumeration.name);
                    });

                    // Mapping the Table attributes to respective datatypes
                    schema.tables.forEach(table => {
                        let fieldsData = '';

                        table.fields.forEach(field => {
                            let fieldName, fieldType;
                            if (field.pk) {
                                // primary key Mapping
                                fieldName = '@Id ' + toCamelCase(field.name);
                                fieldType = 'Long';
                            } else if (appEnums.includes(field.type.type_name)) {
                                // enum mapping
                                fieldName = toCamelCase(field.name);
                                fieldType = capitalizeName(toCamelCase(field.type.type_name));
                                if (duplicateEnums.includes(field.type.type_name)) {
                                    fieldType = capitalizeName(toCamelCase(field.type.type_name + suffix));
                                }
                            } else {
                                // datatype mapping
                                fieldName = toCamelCase(field.name);
                                fieldType = mapFieldType(field.type.type_name.toLowerCase());
                            }

                            fieldsData += `\n    ${fieldName} ${fieldType},`;
                        });

                        var capitalizedName = capitalizeName(table.name);

                        // [Future Release]: Random suffix can be replaced with logical object in future.
                        if (duplicateEntities.includes(table.name)) {
                            capitalizedName = capitalizeName(table.name + suffix);
                        }

                        // Remove the last comma and add table's entity data to the entityData string
                        entityData += `
entity ${toCamelCase(capitalizedName)} {${fieldsData.slice(0, -1)}
}\n`;
                    });
                });
                realtionshipData = this.parseRelationships(database, duplicateEntities, suffix);
                entityData += realtionshipData;
            }
        }

        return entityData;
    } catch (error) {
        console.error('Error parsing DBML:', error);
        const errorMessage = dbmlParseError(error);
        throw new Error(errorMessage);
    }
};
