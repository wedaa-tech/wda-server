const path = require('path');
const fs = require('fs');

/**
 * Get wizard template based on input parameters
 * @param {*} req
 * @param {*} res
 */
exports.getWizardTemplate = function (req, res) {
    const requestBody = req.body;
    const scope = ['fullStack', 'headless', 'spa', 'personalWebsite'];
    if (scope.includes(requestBody.AT)) {
        if (requestBody.AT === 'fullStack' || requestBody.AT === 'headless') {
            const requiredParameters = ['backend', 'database', 'authentication', 'serviceDiscovery', 'logManagement'];
            const missingParameters = [];
            // Check for missing parameters
            requiredParameters.forEach(param => {
                if (!requestBody[param]) {
                    missingParameters.push(param);
                }
            });
            if (requestBody.AT === 'fullStack' && !requestBody.frontend) {
                missingParameters.push('frontend');
            }

            if (missingParameters.length === 0) {
                let globalServiceCount = 0;
                // Check for "skip" values and decrement globalServiceCount accordingly
                ['authentication', 'serviceDiscovery', 'logManagement'].forEach(param => {
                    if (requestBody[param] !== 'skip') {
                        globalServiceCount++;
                    }
                });
                // All required parameters are present, proceed with reading the JSON file
                var filePath = path.join(
                    __dirname,
                    '..',
                    'resources/wizard/fullstack',
                    `${globalServiceCount.toString().padStart(2, '0')}.json`,
                );
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Error reading JSON file.');
                    } else {
                        // Parse the JSON data
                        var jsonData = JSON.parse(data);
                        // Remove the "UI" nodes from the json object, if scope is headless
                        if (requestBody.AT === 'headless') {
                            delete jsonData.nodes.UI_1;
                            delete jsonData.edges['UI_1-Service_1'];
                            delete jsonData.edges['UI_1-Service_2'];
                            delete jsonData.edges['UI_1-Service_3'];
                            delete jsonData.edges['UI_1-Service_4'];
                        }
                        // Replace "mongodb" with requestBody.database, "react" with requestBody.frontend, and "spring" with requestBody.backend
                        const jsonString = JSON.stringify(jsonData);
                        let modifiedJsonString = jsonString
                            .replace(/"mongodb"/g, `"${requestBody.database}"`)
                            .replace(/"gomicro"/g, `"${requestBody.backend}"`);
                        // Replace "react" with requestBody.frontend, if the scope is fullStack
                        if (requestBody.AT === 'fullStack') {
                            modifiedJsonString = modifiedJsonString.replace(/"react"/g, `"${requestBody.frontend}"`);
                        }
                        const globalService = [];
                        // Check for "skip" values and decrement globalServiceCount accordingly
                        ['authentication', 'serviceDiscovery', 'logManagement'].forEach(param => {
                            if (requestBody[param] !== 'skip') {
                                globalService.push(param);
                            }
                        });
                        if (globalServiceCount === 1) {
                            if (globalService.includes('logManagement')) {
                                modifiedJsonString = modifiedJsonString
                                    .replace(/"authenticationType"/g, `"logManagementType"`)
                                    .replace(/"oauth2"/g, `"eck"`)
                                    .replace(/"selectorNode3"/g, `"selectorNode6"`);
                            }
                            if (globalService.includes('serviceDiscoveryType')) {
                                modifiedJsonString = modifiedJsonString
                                    .replace(/"authenticationType"/g, `"serviceDiscoveryType"`)
                                    .replace(/"oauth2"/g, `"eureka"`)
                                    .replace(/"selectorNode3"/g, `"selectorNode1"`);
                            }
                        } else if (globalServiceCount === 2) {
                            if (globalService.includes('logManagement') && globalService.includes('authentication')) {
                                modifiedJsonString = modifiedJsonString
                                    .replace(/"serviceDiscoveryType"/g, `"logManagementType"`)
                                    .replace(/"eureka"/g, `"eck"`)
                                    .replace(/"selectorNode1"/g, `"selectorNode6"`);
                            }
                            if (globalService.includes('logManagement') && globalService.includes('serviceDiscovery')) {
                                modifiedJsonString = modifiedJsonString
                                    .replace(/"authenticationType"/g, `"logManagementType"`)
                                    .replace(/"oauth2"/g, `"eck"`)
                                    .replace(/"selectorNode3"/g, `"selectorNode6"`);
                            }
                        }
                        // Parse the modified JSON data
                        jsonData = JSON.parse(modifiedJsonString);
                        // Send the JSON data as a response
                        res.json(jsonData);
                    }
                });
            } else {
                // If one or more required parameters are missing, return an error response
                res.status(400).json({ error: `Missing parameters: ${missingParameters.join(', ')}` });
            }
        } else if (requestBody.AT === 'spa') {
            const requiredParameters = ['frontend', 'authentication'];
            const missingParameters = [];
            // Check for missing parameters
            requiredParameters.forEach(param => {
                if (!requestBody[param]) {
                    missingParameters.push(param);
                }
            });
            if (missingParameters.length === 0) {
                // All required parameters are present, proceed with reading the JSON file
                var filePath = path.join(__dirname, '..', 'resources/wizard/spa', `00.json`);
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Error reading JSON file.');
                    } else {
                        // Parse the JSON data
                        var jsonData = JSON.parse(data);
                        if (requestBody.authentication === 'skip') {
                            delete jsonData.nodes.authenticationType;
                            delete jsonData.edges;
                        }
                        const jsonString = JSON.stringify(jsonData);
                        let modifiedJsonString = jsonString.replace(/"react"/g, `"${requestBody.frontend}"`);
                        // Parse the modified JSON data
                        jsonData = JSON.parse(modifiedJsonString);
                        // Send the JSON data as a response
                        res.json(jsonData);
                    }
                });
            } else {
                // If one or more required parameters are missing, return an error response
                res.status(400).json({ error: `Missing parameters: ${missingParameters.join(', ')}` });
            }
        } else if (requestBody.AT === 'personalWebsite') {
            const requiredParameters = ['docusaurus'];
            const missingParameters = [];
            // Check for missing parameters
            requiredParameters.forEach(param => {
                if (!requestBody[param]) {
                    missingParameters.push(param);
                }
            });
            if (missingParameters.length === 0) {
                // All required parameters are present, proceed with reading the JSON file
                var filePath = path.join(__dirname, '..', 'resources/wizard/personalWebsite', `00.json`);
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Error reading JSON file.');
                    } else {
                        // Parse the JSON data
                        var jsonData = JSON.parse(data);
                        const jsonString = JSON.stringify(jsonData);
                        let modifiedJsonString = jsonString;
                        if (requestBody.docusaurus === 'default') {
                            modifiedJsonString = modifiedJsonString
                                .replace(/"personalprofile"/g, `"documentation"`)
                                .replace(/"profile"/g, `"default"`)
                                .replace(/"Profile"/g, `"Docs"`);
                        }
                        // Parse the modified JSON data
                        jsonData = JSON.parse(modifiedJsonString);
                        // Send the JSON data as a response
                        res.json(jsonData);
                    }
                });
            } else {
                // If one or more required parameters are missing, return an error response
                res.status(400).json({ error: `Missing parameters: ${missingParameters.join(', ')}` });
            }
        }
    } else {
        // If AT is not in scope, return an error response
        res.status(400).json({ error: 'Invalid value for AT.' });
    }
};
