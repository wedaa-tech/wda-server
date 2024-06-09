const { Parser } = require('@dbml/core');
const { dbmlParseError } = require('./error');
const { capitalizeName, toCamelCase } = require('../helper');
const { getDuplicateTableNames } = require('./helper');

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
exports.parseRelationships = (database, duplicateEntities, prefix) => {
    let relationships = '';

    database.schemas.forEach(schema => {
        schema.refs.forEach(ref => {
            if (ref.endpoints.length === 2) {
                const [endpoint1, endpoint2] = ref.endpoints;
                const relationshipType = mapRelationshipType(endpoint1.relation, endpoint2.relation);

                if (relationshipType) {
                    var endpoint1TableName = capitalizeName(endpoint1.tableName);
                    var endpoint2TableName = capitalizeName(endpoint2.tableName);

                    // [Future Release]: Random prefix can be replaced with logic object in future.
                    if (duplicateEntities.includes(endpoint1.tableName)) {
                        endpoint1TableName = capitalizeName(endpoint1TableName + prefix);
                    }
                    // [Future Release]: Random prefix can be replaced with logic object in future.
                    if (duplicateEntities.includes(endpoint2.tableName)) {
                        endpoint2TableName = capitalizeName(endpoint2TableName + prefix);
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

    try {
        for (let i = 0; i < applicationCount; i++) {
            if (applications[i].clientFramework === undefined || applications[i].clientFramework === null) {
                const database = new Parser().parse(applications[i].dbmlData, 'dbml');
                var prefix = applications[i].prefix;

                // Iterate through the schemas and tables to form the entityData
                database.schemas.forEach(schema => {
                    schema.tables.forEach(table => {
                        let fieldsData = '';

                        table.fields.forEach(field => {
                            let fieldName, fieldType;
                            if (field.pk) {
                                fieldName = '@Id ' + toCamelCase(field.name);
                                fieldType = 'Long';
                            } else {
                                fieldName = toCamelCase(field.name);
                                fieldType = mapFieldType(field.type.type_name);
                            }

                            fieldsData += `\n    ${fieldName} ${fieldType},`;
                        });

                        var capitalizedName = capitalizeName(table.name);

                        // [Future Release]: Random prefix can be replaced with logical object in future.
                        if (duplicateEntities.includes(table.name)) {
                            capitalizedName = capitalizeName(table.name + prefix);
                        }

                        // Remove the last comma and add table's entity data to the entityData string
                        entityData += `
entity ${toCamelCase(capitalizedName)} {${fieldsData.slice(0, -1)}
}\n`;
                    });
                });
                realtionshipData = this.parseRelationships(database, duplicateEntities, prefix);
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

