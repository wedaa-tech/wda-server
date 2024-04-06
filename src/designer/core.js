const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const utils = require('../utils/core');
const jdlConverter = require('../utils/jsonToJdl');
const exec = require('child_process').exec;
const weave = require('../weaver/codeWeaver');
const { saveBlueprint } = require('../services/blueprintService');
const { send } = require('../configs/rabbitmq/producer');
const { CODE_GENERATION } = require('../configs/rabbitmq/constants');
const blueprintDao = require('../repositories/blueprintDao');




/**
 * Generates a prototype based on the provided blueprint.
 * This method retrieves the saved blueprint from the database.
 * @param {Object} blueprint - The blueprint object containing project details.
 */
exports.prototype = async  function (blueprint) {
    await blueprintDao.getByProjectId({ project_id: blueprint.blueprintId })
        .then(result => {
            blueprint = result;
        })
        .catch(error => {
            console.error("Error retrieving saved blueprint:", error);
        });

    // TODO: check if the response can be changed to single object instead of list 
    const body = blueprint[0].request_json;
    const userId = blueprint[0].user_id;
    const fileName = body.projectId;

    console.log('Generating prototype: ' + body.projectName + ', for user: ' + userId);

    // boolean check to trigger Infrastructure file generation
    var deployment = false;
    if (body.deployment !== null) {
        deployment = true;
        body.deployment.projectName = body.projectName;
    }

    // Generates the Dir for Blueprints
    utils.generateBlueprint(body.projectId);

    // Validate & Create a json file for the jhipster generator
    utils.createJsonFile(fileName, body);

    // JSON to JDL, with 5 sec wait for the json to get generated
    setTimeout(function () {
        console.log('Waiting 5 sec for the jdl to be generated');
        const response =  jdlConverter.createJdlFromJson(fileName);
        // check if the error response object exists before returning it
        if (response) {
            return response;
        }
        // Check if deployment type is minikube
        var minikube = '';
        if (body.deployment !== null && body.deployment.cloudProvider !== null && body.deployment.cloudProvider === 'minikube') {
            minikube = '--minikube';
        }

        // Child process to generate the architecture
        console.log('Generating Architecture files...');
        exec(
            `cd ${body.projectId} && jhipster jdl ../${fileName}.jdl --skip-install --skip-git --no-insight --skip-jhipster-dependencies --force ${minikube}`,
            async function (error, stdout, stderr) {
                if (stdout !== '') {
                    console.log('---------stdout: ---------\n' + stdout);
                }

                if (stderr !== '') {
                    console.log('---------stderr: ---------\n' + stderr);
                }

                if (error !== null) {
                    console.log('---------exec error: ---------\n[' + error + ']');
                }

                console.log('Architecture Generation completed successfully.....');

                const folderPath = `./${body.projectId}`;
                var services = body.services;

                // // TODO:- Would require to get the token for AI API calls
                // // Stitching AI code starts from here
                // console.log('****************************************************');
                // try {
                //     console.log('AI CODE WEAVING STARTS');
                //     await weave(folderPath, services, accessToken);
                //     console.log('AI CODE WEAVING ENDS');
                // } catch (error) {
                //     // if there is an error in AI CODE WEAVING, Code zip will not be generated
                //     console.error('Error while weaving[propagated error]:', error);
                //     utils.removeDump(folderPath);
                //     return res.status(500).send({ error: 'Execution stopped' });
                // }
                // console.log('****************************************************');

                // check if application documentation is enabled
                var docsDetails = Object.values(services).find(service => service.applicationFramework === 'docusaurus');
                var documentGenerator = !!docsDetails;
                if (documentGenerator) {
                    console.log('Generating Docusaurus files...');
                    generateDocusaurusFiles(fileName, folderPath, deployment, body, userId);
                } else {
                    triggerTerraformGenerator(folderPath, deployment, body, userId);
                }
            },
        );
    }, 5000);
}

/**
 * Sends the latest ZIP file located in a specific folder to the client for download.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 */
exports.download = function (req, res) {
    const userId = req.kauth?.grant?.access_token?.content?.sub;
    const blueprintId = req.params.blueprintId;

    const rootFolder = process.env.BLUEPRINT_ROOT_FOLDER;
    const folderPath = path.join(rootFolder, userId, blueprintId);

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (files.length === 0) {
            return res.status(404).json({ error: 'No ZIP files found in the folder' });
        }

        // Sort files by name to get the latest one
        files.sort();

        const latestZip = path.join(folderPath, files[files.length - 1]);
        // Set the Content-Disposition header to specify the filename
        const fileName = `${blueprintId}.zip`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // Stream the file to the response
        const fileStream = fs.createReadStream(latestZip);
        fileStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
        fileStream.pipe(res);
    });
};


/**
 * Create's a blueprint and send's a message to a message queue[rabbitmq].
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns {Promise<void>} blueprint - The response object.
 */
exports.generate = async function (req, res) {
    try {
        const blueprint = await saveBlueprint(req);
        // TODO: Handle send with in try/catch
        // Send a message to the message queue for code generation
        send(CODE_GENERATION, blueprint);
        return res.status(200).json({ blueprintId: blueprint.blueprintId, projectId: blueprint.parentId });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error generating blueprint' });
    }
};

/**
 * Child process to generate the Infrastructure files
 *
 * @param {string} fileName : random string with 9 characters
 * @param {string} folderPath : combination of the projectName + fileName
 * @param {string} userId
 */
const generateTerraformFiles = (fileName, folderPath, userId) => {
    exec(`yo tf-wdi --file ./${fileName}.json`, function (error, stdout, stderr) {
        if (stdout !== '') {
            console.log('---------stdout: ---------\n' + stdout);
        }

        if (stderr !== '') {
            console.log('---------stderr: ---------\n' + stderr);
        }

        if (error !== null) {
            console.log('---------exec error: ---------\n[' + error + ']');
        }

        // Generation of Infrastructure zip file with in the callback function of child process.
        utils.generateZip(folderPath, userId);
    });
};

/**
 * Child process to generate the Docusaurus files
 *
 * @param {*} fileName   : random string with 9 characters
 * @param {*} folderPath : combination of filename and project name
 * @param {*} deployment : deployment check boolean
 * @param {*} body       : request body
 * @param {string} userId
 */
const generateDocusaurusFiles = (fileName, folderPath, deployment, body, userId) => {
    exec(`cd ${folderPath} && yo docusaurus --file ../${fileName}-docusaurus.json`, function (error, stdout, stderr) {
        if (stdout !== '') {
            console.log('---------stdout: ---------\n' + stdout);
        }

        if (stderr !== '') {
            console.log('---------stderr: ---------\n' + stderr);
        }

        if (error !== null) {
            console.log('---------exec error: ---------\n[' + error + ']');
        }
        triggerTerraformGenerator(folderPath, deployment, body, userId);
    });
};

/**
 * trigger tf-wdi generator to generate the Infrastructure files
 *
 * @param {*} folderPath : combination of filename and project name
 * @param {*} deployment : deployment check boolean
 * @param {*} body       : request body
 * @param {string} userId
 */
const triggerTerraformGenerator = (folderPath, deployment, body, userId) => {
    // If deployment is true, then generate Terraform files as well and then generate the zip archive.
    if (deployment) {
        console.log('Generating Infrastructure files...');
        const jsonFileForTerraform = nanoid(9);
        var infraJson = utils.infraJsonGenerator(body);
        // Generate json file for infraJson, if deployment is true
        utils.createJsonFile(jsonFileForTerraform, infraJson);
        //Invoke tf-wdi generator
        generateTerraformFiles(jsonFileForTerraform, folderPath, userId);
        console.log('Zipping Architecture/Infrastructure files completed successfully.....');
    } else {
        // Generation of Architecture zip, with in the call back function of child process.
        utils.generateZip(folderPath, userId);
        console.log('Zipping Architecture files completed successfully.....');
    }
};
