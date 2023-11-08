const path = require('path');
const fs = require('fs');

/**
  * Get wizard template based on input parameters
  * @param {*} req 
  * @param {*} res 
  */
exports.getWizardTemplate = function (req, res) {
    const requestBody = req.body;
    const missingParameters = [];
    if (!requestBody.frontend) {
        missingParameters.push('frontend');
    }
    if (!requestBody.backend) {
        missingParameters.push('backend');
    }
    if (!requestBody.database) {
        missingParameters.push('database');
    }
    if (missingParameters.length === 0) {
        // All required parameters are present, proceed with reading the JSON file
        const filePath = path.join(__dirname, '..', 'resources', 'static-wizard-template.json');

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error reading JSON file.');
            } else {
                // Parse the JSON data
                var jsonData = JSON.parse(data);

                // Replace "mongodb" with requestBody.database, "react" with requestBody.frontend, and "spring" with requestBody.backend
                const jsonString = JSON.stringify(jsonData);
                const modifiedJsonString = jsonString
                .replace(/"mongodb"/g, `"${requestBody.database}"`)
                .replace(/"react"/g, `"${requestBody.frontend}"`)
                .replace(/"gomicro"/g, `"${requestBody.backend}"`);
      
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
};