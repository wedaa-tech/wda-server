const fs = require('fs');
const path = require('path');
const utils = require('../utils/core');
const jdlConverter = require('../utils/jsonToJdl');
const exec = require('child_process').exec;
const weave = require('../weaver/codeWeaver');
const { saveBlueprint, getBlueprintById } = require('../services/blueprintService');
const { send } = require('../configs/rabbitmq/producer');
const { CODE_GENERATION } = require('../configs/rabbitmq/constants');
const { saveCodeGeneration, updateCodeGeneration, checkIfCodeGenerationExists } = require('../services/codeGenerationService');
const { checkFlagsEnabled } = require('../configs/feature-flag.js');
const { codeGenerationStatus } = require('../utils/constants.js');

/**
 * Generates a prototype based on the provided blueprint Info.
 * This method retrieves the saved blueprint from the database.
 * @param {Object} blueprint - The blueprint object containing prototype details.
 */
exports.prototype = async function (blueprintInfo) {
    // update the code_generation to IN-PROGRESS
    const codeGenerationId = blueprintInfo.codeGenerationId;
    const accessToken = blueprintInfo.accessToken;
    var codeGeneration = { status: codeGenerationStatus.IN_PROGRESS };
    await updateCodeGeneration(codeGenerationId, codeGeneration);

    // get blueprint to process the prototype
    const blueprint = await getBlueprintById(blueprintInfo.blueprintId);

    const body = blueprint.request_json;
    const userId = blueprint.user_id;
    const fileName = body.projectId;

    // Form a context object which will contain the information to be passed to generate zip & update code_generation
    var context = {
        userId: userId,
        codeGenerationId: codeGenerationId,
    };

    console.log('Generating prototype: ' + body.projectName + ', for user: ' + userId);

    // Boolean check to trigger Infrastructure file generation
    var deployment = false;
    if (body.deployment !== undefined && body.deployment !== null) {
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
        const folderPath = `./${body.projectId}`;
        try {
            jdlConverter.createJdlFromJson(fileName);
        } catch (error) {
            utils.cleanUp(codeGenerationId, error.message, folderPath);
            return;
        }

        // Check if deployment type is minikube
        var minikube = '';
        if (
            body.deployment !== undefined &&
            body.deployment !== null &&
            body.deployment.cloudProvider !== undefined &&
            body.deployment.cloudProvider !== null &&
            body.deployment.cloudProvider === 'minikube'
        ) {
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
                    utils.cleanUp(codeGenerationId, error.message, folderPath);
                    return;
                }
                console.log('Architecture Generation completed successfully.....');

                var services = body.services;

                // Stitching AI code starts from here
                aiEnabled = await checkFlagsEnabled('ai_wizard');
                // TODO: Below code will never excute [Can be removed in future]
                aiEnabled = false;
                if (aiEnabled) {
                    console.log('****************************************************');
                    try {
                        console.log('AI CODE WEAVING STARTS');
                        await weave(folderPath, services, accessToken);
                        console.log('AI CODE WEAVING ENDS');
                    } catch (error) {
                        // if there is an error in AI CODE WEAVING, Code zip will not be generated
                        console.error('Error while weaving[propagated error]:', error);
                        utils.cleanUp(codeGenerationId, error.message, folderPath);
                        return;
                    }
                    console.log('****************************************************');
                }

                // check if application documentation is enabled
                var docsDetails = Object.values(services).find(service => service.applicationFramework === 'docusaurus');
                var documentGenerator = !!docsDetails;
                if (documentGenerator) {
                    console.log('Generating Docusaurus files...');
                    generateDocusaurusFiles(fileName, folderPath, deployment, body, context);
                } else {
                    triggerTerraformGenerator(folderPath, deployment, body, context);
                }
            },
        );
    }, 5000);
};

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
        fileStream.on('error', error => {
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
        const accessToken = req.kauth?.grant?.access_token?.token;
        const blueprint = await saveBlueprint(req);
        var oldCodeGeneration = {
            blueprintId: blueprint.blueprintId,
            blueprintVersion: blueprint.version,
        };
        const codeGenerationExist = await checkIfCodeGenerationExists(oldCodeGeneration);
        if (!codeGenerationExist) {
            var codeGeneration = {
                blueprintId: blueprint.blueprintId,
                blueprintVersion: blueprint.version,
            };
            const codeGenerationId = await saveCodeGeneration(codeGeneration);
            // passing codeGenerationId & accessToken to message broker
            blueprint.codeGenerationId = codeGenerationId;
            blueprint.accessToken = accessToken;
            // Send a message to the message queue for code generation
            try {
                await send(CODE_GENERATION, blueprint);
            } catch (error) {
                // code_generation is not yet submitted to message queue, as there is an error will pushing it to message queue
                utils.cleanUp(codeGenerationId, error.message, folderPath);
                throw error;
            }
        }
        return res.status(200).json({ blueprintId: blueprint.blueprintId, parentId: blueprint.parentId });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error generating blueprint' });
    }
};

/**
 * Child process to generate the Infrastructure files
 *
 * @param {string} fileName   : random string with 9 characters
 * @param {string} folderPath : combination of the projectName + fileName
 * @param {string} context    : contains userId, codeGenerationId
 */
const generateTerraformFiles = (fileName, folderPath, context) => {
    exec(`yo tf-wdi --file ./${fileName}.json`, function (error, stdout, stderr) {
        if (stdout !== '') {
            console.log('---------stdout: ---------\n' + stdout);
        }

        if (stderr !== '') {
            console.log('---------stderr: ---------\n' + stderr);
        }

        if (error !== null) {
            console.log('---------exec error: ---------\n[' + error + ']');
            utils.cleanUp(context.codeGenerationId, error.message, folderPath);
            return;
        }

        // Generation of Infrastructure zip file with in the callback function of child process.
        utils.generateZip(folderPath, context);
    });
};

/**
 * Child process to generate the Docusaurus files
 *
 * @param {*} fileName   : random string with 9 characters
 * @param {*} folderPath : combination of filename and project name
 * @param {*} deployment : deployment check boolean
 * @param {*} body       : request body
 * @param {*} context    : contains userId, codeGenerationId
 */
const generateDocusaurusFiles = (fileName, folderPath, deployment, body, context) => {
    exec(`cd ${folderPath} && yo docusaurus --file ../${fileName}-docusaurus.json`, function (error, stdout, stderr) {
        if (stdout !== '') {
            console.log('---------stdout: ---------\n' + stdout);
        }

        if (stderr !== '') {
            console.log('---------stderr: ---------\n' + stderr);
        }

        if (error !== null) {
            console.log('---------exec error: ---------\n[' + error + ']');
            utils.cleanUp(context.codeGenerationId, error.message, folderPath);
            return;
        }
        triggerTerraformGenerator(folderPath, deployment, body, context);
    });
};

/**
 * trigger tf-wdi generator to generate the Infrastructure files
 *
 * @param {*} folderPath : combination of filename and project name
 * @param {*} deployment : deployment check boolean
 * @param {*} body       : request body
 * @param {*} context    : contains userId, codeGenerationId
 */
const triggerTerraformGenerator = (folderPath, deployment, body, context) => {
    // If deployment is true, then generate Terraform files as well and then generate the zip archive.
    if (deployment) {
        console.log('Generating Infrastructure files...');
        const jsonFileForTerraform = folderPath.slice(-9);
        var infraJson = utils.infraJsonGenerator(body);
        // Generate json file for infraJson, if deployment is true
        utils.createJsonFile(jsonFileForTerraform, infraJson);
        //Invoke tf-wdi generator
        generateTerraformFiles(jsonFileForTerraform, folderPath, context);
    } else {
        // Generation of Architecture zip, with in the call back function of child process.
        utils.generateZip(folderPath, context);
    }
};
