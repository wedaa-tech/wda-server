const fs = require('fs');
const path = require('path');
const { generateLiquibase, generateEntities, generateServiceCode } = require('./aicore.js');
const { LIQUIBASE_CHANGELOG, JAVA, DOMAIN } = require('./constants.js');

function writeFile(filePath, data) {
    try {
        // Extract the root directory from the filePath
        const rootDir = filePath.split(path.sep)[0];

        // Check if the root directory exists
        if (!fs.existsSync(rootDir)) {
            console.log(`Root directory ${rootDir} does not exist. File not written.`);
            throw new Error(`Root directory ${rootDir} does not exist`);
        }

        // Create the sub-directory if it doesn't exist
        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }

        // Write the content to the file
        console.log(new Date(), "File writing started");
        fs.writeFileSync(filePath, data);
        console.log(new Date(), "File written | filePath:", path.join(path.dirname(filePath)));
    } catch (err) {
        throw err;
    }
}

async function includeLiquibase(folderPath, content) {
    try {
        // Call the Liquibase API to generate the DBML data
        console.log(new Date(), "Processing liquibase |", "serviceName:", content.applicationName);
        const response = await generateLiquibase({ dbml: content.dbmlData }, content.accessToken);

        // Check if response is present
        if (response) {
            // After successfully generating the DBML data, write the Liquibase file
            const serviceDirectoryPath = path.join(folderPath, content.applicationName, LIQUIBASE_CHANGELOG);
            const filePath = path.join(serviceDirectoryPath, `${content.applicationName}_initial_schema.xml`);
            writeFile(filePath, response.liquibase);
            console.log(new Date(), "Liquibase file written | serviceName:", content.applicationName);
        } else {
            console.error('Error: No response from Liquibase API');
            throw new Error('No response from Liquibase API');
        }
    } catch (error) {
        console.error('Error calling generateLiquibase()', error);
        throw error;
    }
}

async function includeEntities(folderPath, content) {
    try {
        // Call the Entities API to generate the entity files
        console.log(new Date(), "Processing entities  |", "serviceName:", content.applicationName);
        const response = await generateEntities({ packageName: content.packageName, dbml: content.dbmlData }, content.accessToken);

        // Check if response is present
        if (response) {
            // Write entity files for each response
            response.forEach(eachResponse => {
                const PACKAGE_NAME = content.packageName.replace(/\./g, '/');
                const serviceDirectoryPath = path.join(folderPath, content.applicationName, JAVA, PACKAGE_NAME, DOMAIN);
                const filePath = path.join(serviceDirectoryPath, `${eachResponse.name}.java`);
                writeFile(filePath, eachResponse.entity);
            });
            console.log(new Date(), "All Entity files written | serviceName:", content.applicationName);
            return response;
        } else {
            console.error('Error: No response from Entities API');
            throw new Error('No response from Entities API');
        }
    } catch (error) {
        console.error('Error calling generateEntities()', error);
        throw error;
    }
}

async function includeServiceCode(folderPath, content) {
    try {
        // Call the Service code API to generate the service files
        const modelDataList = content.modelDataList;

        // Create an array to store all promises
        const serviceCodePromises = [];

        for (const eachmodelData of modelDataList) {
            console.log(new Date(), "Processing service-code |", "serviceName:", content.applicationName, " | modelName:", eachmodelData.name);
            // Push the promise for each generateServiceCode call to the array
            serviceCodePromises.push(
                generateServiceCode({ packageName: content.packageName, modelClass: eachmodelData.entity }, content.accessToken)
                    .then(response => {
                        if (response) {
                            // Write repository, service and controller classes
                            for (const eachResponse of response) {
                                const PACKAGE_NAME = eachResponse.package.replace(/\./g, '/');
                                const serviceDirectoryPath = path.join(folderPath, content.applicationName, JAVA, PACKAGE_NAME);
                                const filePath = path.join(serviceDirectoryPath, `${eachResponse.name}.java`);
                                writeFile(filePath, eachResponse.code);
                            }
                            console.log(new Date(), "All Service Code files written | serviceName:", content.applicationName);
                        } else {
                            console.error('Error: No response from Service Code API');
                            throw new Error('No response from Service Code API');
                        }
                    })
                    .catch(error => {
                        console.error('Error calling generateServiceCode()', error);
                        throw error;
                    })
            );
        }
        // Wait for all promises to resolve
        await Promise.all(serviceCodePromises);
    } catch (error) {
        console.error('Error occured while generating all the service code', error);
        throw error;
    }
}



async function weave(folderPath, services, accessToken) {
    console.log("####################################################");

    const includeLiquibasePromises = [];
    const includeEntitiesPromises = [];

    Object.keys(services).forEach((key) => {
        const service = services[key];
        if (service.applicationFramework === "spring" &&
            service.prodDatabaseType === "postgresql" &&
            service.hasOwnProperty("dbmlData") &&
            service.dbmlData !== null &&
            service.dbmlData !== "") {
            const liquibaseRequest = {
                applicationName: service.applicationName,
                dbmlData: service.dbmlData,
                accessToken: accessToken,
            };
            includeLiquibasePromises.push(includeLiquibase(folderPath, liquibaseRequest));

            const entitiesRequest = {
                applicationName: service.applicationName,
                packageName: service.packageName,
                dbmlData: service.dbmlData,
                accessToken: accessToken,
            };

            // Associate applicationName with the promise
            const entitiesPromiseObject = {
                promise: includeEntities(folderPath, entitiesRequest),
                applicationName: service.applicationName,
                packageName: service.packageName,
                accessToken: accessToken,
            };
            includeEntitiesPromises.push(entitiesPromiseObject);
        }

    });

    // waiting for the liquibase file to be written
    await Promise.all(includeLiquibasePromises);

    // waiting for the entities files to be written, then generate the service code.
    await Promise.all(includeEntitiesPromises.map(promiseObj => promiseObj.promise))
        .then(async (entitiesResponses) => {
            for (let index = 0; index < entitiesResponses.length; index++) {
                const response = entitiesResponses[index];
                const serviceCodeRequest = {
                    applicationName: includeEntitiesPromises[index].applicationName,
                    packageName: includeEntitiesPromises[index].packageName,
                    modelDataList: response,
                    accessToken: accessToken,
                };
                await includeServiceCode(folderPath, serviceCodeRequest);
            }
        });

    console.log("####################################################");
}


module.exports = weave;