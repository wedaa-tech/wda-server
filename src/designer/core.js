const { nanoid } = require('nanoid');
const utils = require('../utils/core');
const jdlConverter = require('../utils/jsonToJdl');
const exec = require('child_process').exec;
const weave = require('../weaver/codeWeaver');

/**
 * generates services/infrastructure code from blueprint
 * @param {*} req
 * @param {*} res
 */
exports.generate = async function (req, res) {
    const body = req.body;
    const userId = req.kauth?.grant?.access_token?.content?.sub;
    const accessToken = req.kauth?.grant?.access_token?.token;
    console.log('Generating project: ' + body.projectName + ', for user: ' + userId);

    const fileName = nanoid(9);
    // To over ride the frontend value (and to maintain unique folder name)
    if (!body.projectId) {
        // Remove spaces and convert to lowercase for body.projectName
        body.projectId = utils.generateProjectId(body.projectName, fileName);
    }
    const metadata = body.metadata;
    // preprocessing the request json
    if (body.metadata === undefined) {
        delete body.parentId; // dereferencing the parent id from blueprint if save Project check is disabled.
    }
    var deployment = false;
    if (body.deployment !== undefined) {
        deployment = true;
        body.deployment.projectName = body.projectName;
    }

    // Generates the Dir for Blueprints
    utils.generateBlueprint(body.projectId, res);

    // Delete the "metadata" attribute from the JSON data
    delete body.metadata;

    // Validate & Create a json file for the jhipster generator
    utils.createJsonFile(fileName, body);

    // JSON to JDL, with 5 sec wait for the json to get generated
    setTimeout(function () {
        console.log('Waiting 5 sec for the jdl to be generated');
        const response = jdlConverter.createJdlFromJson(fileName, metadata, req, res);
        // check if the error response object exists before returning it
        if (response) {
            return response;
        }
        // Check if deployment type is minikube
        var minikube = '';
        if (body.deployment !== undefined && body.deployment.cloudProvider !== undefined && body.deployment.cloudProvider === 'minikube') {
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

                // Stitching AI code starts from here
                console.log('****************************************************');
                try {
                    console.log('AI CODE WEAVING STARTS');
                    await weave(folderPath, services, accessToken);
                    console.log('AI CODE WEAVING ENDS');
                } catch (error) {
                    // if there is an error in AI CODE WEAVING, Code zip will not be generated
                    console.error('Error while weaving[propagated error]:', error);
                    utils.removeDump(folderPath);
                    return res.status(500).send({ error: 'Execution stopped' });
                }
                console.log('****************************************************');

                // check if application documentation is enabled
                var docsDetails = Object.values(services).find(service => service.applicationFramework === 'docusaurus');
                var documentGenerator = !!docsDetails;
                if (documentGenerator) {
                    console.log('Generating Docusaurus files...');
                    generateDocusaurusFiles(fileName, folderPath, deployment, body, res);
                } else {
                    triggerTerraformGenerator(folderPath, deployment, body, res);
                }
            },
        );
    }, 5000);
};

/**
 * Child process to generate the Infrastructure files
 *
 * @param {*} fileName : random string with 9 characters
 * @param {*} folderPath : combination of the projectName +fileName
 * @param {*} res  : response to be sent to the user
 */
const generateTerraformFiles = (fileName, folderPath, res) => {
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
        utils.generateZip(folderPath, res);
    });
};

/**
 * Child process to generate the Docusaurus files
 *
 * @param {*} fileName   : random string with 9 characters
 * @param {*} folderPath : combination of filename and project name
 * @param {*} deployment : deployment check boolean
 * @param {*} body       : request body
 * @param {*} res        : response object
 */
const generateDocusaurusFiles = (fileName, folderPath, deployment, body, res) => {
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
        triggerTerraformGenerator(folderPath, deployment, body, res);
    });
};

/**
 * trigger tf-wdi generator to generate the Infrastructure files
 *
 * @param {*} folderPath : combination of filename and project name
 * @param {*} deployment : deployment check boolean
 * @param {*} body       : request body
 * @param {*} res        : response object
 */
const triggerTerraformGenerator = (folderPath, deployment, body, res) => {
    // If deployment is true, then generate Terraform files as well and then generate the zip archive.
    if (deployment) {
        console.log('Generating Infrastructure files...');
        const jsonFileForTerraform = nanoid(9);
        var infraJson = utils.infraJsonGenerator(body);
        // Generate json file for infraJson, if deployment is true
        utils.createJsonFile(jsonFileForTerraform, infraJson);
        //Invoke tf-wdi generator
        generateTerraformFiles(jsonFileForTerraform, folderPath, res);
        console.log('Zipping Architecture/Infrastructure files completed successfully.....');
    } else {
        // Generation of Architecture zip, with in the call back function of child process.
        utils.generateZip(folderPath, res);
        console.log('Zipping Architecture files completed successfully.....');
    }
};
