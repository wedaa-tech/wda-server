const fs = require('fs');
const path = require('path');
const callLiquibaseAPI = require('./AICoreGateway.js');
const { SRC_MAIN_RESOURCES_CONFIG_LIQUIBASE_CHANGELOG } = require('./constants.js');

function writeFileWithDirectoryCreation(filePath, data) {
    try {
        // Create the directory if it doesn't exist
        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }

        // Write the content to the file
        fs.writeFileSync(filePath, data);
        console.log("File written to:", path.join(path.dirname(filePath)));
    } catch (err) {
        console.error("Error writing to file:", err);
    }
}

function weaveLiquibaseFile(folderPath, serviceName, dbmlData) {
    // Call the Liquibase API to generate the DBML data
    const response = callLiquibaseAPI({ dbml: dbmlData });

    // Check if response is present
    if (response) {
        // After successfully generating the DBML data, write the Liquibase file
        const serviceDirectoryPath = path.join(folderPath, serviceName, SRC_MAIN_RESOURCES_CONFIG_LIQUIBASE_CHANGELOG);
        const filePath = path.join(serviceDirectoryPath, `${serviceName}_initial_schema.xml`);
        writeFileWithDirectoryCreation(filePath, response.liquibase);
    } else {
        console.error('Error: No response from Liquibase API');
    }
}

function weaveAIGeneratedCodeIntoExisting(folderPath, services) {
    Object.keys(services).forEach((key) => {
        const service = services[key];
        weaveLiquibaseFile(folderPath, service.applicationName, service.dbmlData);
    });
}

module.exports = weaveAIGeneratedCodeIntoExisting;