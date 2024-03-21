const fs = require('fs');
const path = require('path');
const { generateLiquibase, generateEntities, generateServiceCode } = require('./aicore.js');
const { LIQUIBASE_CHANGELOG, JAVA, DOMAIN } = require('./constants.js');

function writeFile(filePath, data) {
    try {
        // Create the directory if it doesn't exist
        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }

        // Write the content to the file
        console.log("File writing started:", new Date());
        fs.writeFileSync(filePath, data);
        console.log("File written to:", path.join(path.dirname(filePath)));
    } catch (err) {
        console.error("Error writing to file:", err);
    }
}

async function includeLiquibase(folderPath, content) {
    try {
        // Call the Liquibase API to generate the DBML data
        console.log("Processing liquibase", new Date());
        const response = await generateLiquibase({ dbml: content.dbmlData });

        // Check if response is present
        if (response) {
            // After successfully generating the DBML data, write the Liquibase file
            const serviceDirectoryPath = path.join(folderPath, content.applicationName, LIQUIBASE_CHANGELOG);
            const filePath = path.join(serviceDirectoryPath, `${content.applicationName}_initial_schema.xml`);
            writeFile(filePath, response.liquibase);
            console.log("Liquibase file written");
        } else {
            console.error('Error: No response from Liquibase API');
        }
    } catch (error) {
        console.error('Error calling Liquibase API:', error);
    }
}

async function includeEntities(folderPath, content) {
    try {
        // Call the Entities API to generate the entity files
        console.log("Processing entities", new Date());
        const response = await generateEntities({ packageName: content.packageName, dbml: content.dbmlData });

        // Check if response is present
        if (response) {
            // Write entity files for each response
            response.forEach(eachResponse => {
                const PACKAGE_NAME = content.packageName.replace(/\./g, '/');
                const serviceDirectoryPath = path.join(folderPath, content.applicationName, JAVA, PACKAGE_NAME, DOMAIN);
                const filePath = path.join(serviceDirectoryPath, `${eachResponse.name}.java`);
                writeFile(filePath, eachResponse.entity);
            });
            console.log("Entity files written");
            return response;
        } else {
            console.error('Error: No response from Entities API');
        }
    } catch (error) {
        console.error('Error calling Entities API:', error);
    }
}

// async function includeServiceCode(folderPath, content) {
//     try {
//         // Call the Service code API to generate the service files
//         const modelDataList = content.modelDataList;

//         for (const eachmodelData of modelDataList) {
//             console.log("Processing service-code", new Date());
//             const response = await generateServiceCode({ packageName: content.packageName, modelClass: eachmodelData.entity });
//             console.log("RESPONSE FROM SERVICE CODE API", response);

//             // Check if response is present
//             if (response) {
//                 // Write entity files for each response
//                 for (const eachResponse of response) {
//                     const PACKAGE_NAME = eachResponse.package.replace(/\./g, '/');
//                     const serviceDirectoryPath = path.join(folderPath, content.applicationName, JAVA, PACKAGE_NAME);
//                     const filePath = path.join(serviceDirectoryPath, `${eachResponse.name}.java`);
//                     writeFile(filePath, eachResponse.code);
//                 }
//                 console.log("Servic Code files written");
//             } else {
//                 console.error('Error: No response from Servic Code API');
//             }
//         }
//     } catch (error) {
//         console.error('Error calling Entities API:', error);
//     }
// }

async function includeServiceCode(folderPath, content) {
    try {
        // Call the Service code API to generate the service files
        const modelDataList = content.modelDataList;

        // Create an array to store all promises
        const serviceCodePromises = [];

        for (const eachmodelData of modelDataList) {
            console.log("Processing service-code", new Date());
            // Push the promise for each generateServiceCode call to the array
            serviceCodePromises.push(
                generateServiceCode({ packageName: content.packageName, modelClass: eachmodelData.entity })
                    .then(response => {
                        console.log("RESPONSE FROM SERVICE CODE API", response);
                        if (response) {
                            // Write entity files for each response
                            for (const eachResponse of response) {
                                const PACKAGE_NAME = eachResponse.package.replace(/\./g, '/');
                                const serviceDirectoryPath = path.join(folderPath, content.applicationName, JAVA, PACKAGE_NAME);
                                const filePath = path.join(serviceDirectoryPath, `${eachResponse.name}.java`);
                                writeFile(filePath, eachResponse.code);
                            }
                            console.log("Servic Code files written");
                        } else {
                            console.error('Error: No response from Service Code API');
                        }
                    })
                    .catch(error => {
                        console.error('Error calling Service Code API:', error);
                    })
            );
        }
        // Wait for all promises to resolve
        await Promise.all(serviceCodePromises);
    } catch (error) {
        console.error('Error in includeServiceCode:', error);
    }
}



async function weave(folderPath, services) {
    const includeLiquibasePromises = [];
    const includeEntitiesPromises = [];

    Object.keys(services).forEach((key) => {
        const service = services[key];

        const liquibaseRequest = {
            applicationName: service.applicationName,
            dbmlData: service.dbmlData
        };
        includeLiquibasePromises.push(includeLiquibase(folderPath, liquibaseRequest));

        const entitiesRequest = {
            applicationName: service.applicationName,
            packageName: service.packageName,
            dbmlData: service.dbmlData
        };

        // Associate applicationName with the promise
        const entitiesPromiseObject = {
            promise: includeEntities(folderPath, entitiesRequest),
            applicationName: service.applicationName,
            packageName: service.packageName,
        };
        includeEntitiesPromises.push(entitiesPromiseObject);
    });

    // waiting for the liquibase file to be written
    await Promise.all(includeLiquibasePromises);

    //  CHECK HOW THIS WORKS
    // waiting for the entities files to be written, then generate the service code.
    await Promise.all(includeEntitiesPromises.map(promiseObj => promiseObj.promise))
    .then(async (entitiesResponses) => {
        for (let index = 0; index < entitiesResponses.length; index++) {
            const response = entitiesResponses[index];
            console.log("Response for application:", includeEntitiesPromises[index].applicationName);
            console.log("Response for packageName:", includeEntitiesPromises[index].packageName);
            const serviceCodeRequest = {
                applicationName: includeEntitiesPromises[index].applicationName,
                packageName: includeEntitiesPromises[index].packageName,
                modelDataList: response,
            };
            await includeServiceCode(folderPath, serviceCodeRequest);
        }
    });

    console.log("################################################");
}


module.exports = weave;