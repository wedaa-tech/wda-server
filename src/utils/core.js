const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { nanoid } = require('nanoid');

/**
 * The method will generate json file for the Terraform generator
 *
 * @param {*} fileName : name of the file to generate
 * @param {*} body : body of json file to generate
 */
exports.createJsonFile = (fileName, body) => {
    var services = body.services;
    if (services !== undefined && services !== null) {
        var docsDetails = Object.values(services).find(service => service.applicationFramework === 'docusaurus');
        var documentGenerator = !!docsDetails;
        if (documentGenerator) {
            const filePath = `${fileName}-docusaurus.json`;
            fs.writeFile(filePath, JSON.stringify(docsDetails, null, 4), 'utf8', err => {
                if (err) {
                    console.error('Error writing docusaurus config file:', err);
                } else {
                    console.log('Docusaurus config file saved successfully:', filePath);
                }
            });
        }
    }
    fs.writeFile(`${fileName}.json`, JSON.stringify(body, null, 4), 'utf8', function (err, result) {
        if (body.cloudProvider !== undefined) {
            fs.writeFile(`${body.projectId}/blueprints/infra-blueprint.json`, JSON.stringify(body, null, 4), 'utf8', err => {
                if (err) throw err;
            });
        } else {
            fs.writeFile(`${body.projectId}/blueprints/req-blueprint.json`, JSON.stringify(body, null, 4), 'utf8', err => {
                if (err) throw err;
            });
            if (docsDetails !== undefined) {
                fs.writeFile(`${body.projectId}/blueprints/docs-blueprint.json`, JSON.stringify(docsDetails, null, 4), 'utf8', err => {
                    if (err) throw err;
                });
            }
        }
    });
};

/**
 * The method will generate dir for the blueprint
 *
 * @param {*} folderPath :
 */

exports.generateBlueprint = (folderPath, res) => {
    const destDir = folderPath;
    fs.mkdir(destDir, { recursive: true }, err => {
        if (err) {
            console.error(err);
            res.status(500).send('Error creating destination folder');
            return;
        }
    });
    const destDirForBlueprints = path.join(folderPath, `blueprints`);
    fs.mkdir(destDirForBlueprints, { recursive: true }, err => {
        if (err) {
            console.error(err);
            res.status(500).send('Error creating destination folder');
            return;
        }
    });
};

/**
 * The method will generate the zip of the any folder and attach it to the response
 *
 * @param {*} folderPath : Folder Path
 * @param {*} res : Response header
 */
exports.generateZip = (folderPath, res) => {
    // Set a custom response header with blueprintId
    var blueprintId = folderPath;
    blueprintId = blueprintId.substring(2);
    res.setHeader('blueprintId', blueprintId);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', function (err) {
        res.status(500).send({ error: err.message });
    });

    // Set the content type of the response to a zip file.
    res.attachment('archive.zip');

    // Pipe the archive to the response stream.
    archive.pipe(res);

    // Add the folder to the archive.
    archive.directory(folderPath, false);

    // archive.finalize();

    // Finalize the archive and delete the dump folders/files.
    archive
        .finalize()
        .then(() => {
            // Remove the folder once the archive is complete.
            fs.rm(folderPath, { recursive: true }, err => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(folderPath, 'Directory removed');
                }
            });

            // Remove all .json and .jdl files except [ "package.json", "package-lock.json" ,"wdi-wda-example.json", "reminder.jdl" ]
            const excludedFiles = ['package.json', 'package-lock.json', 'wdi-wda-example.json', 'reminder.jdl'];
            fs.readdir(`${process.cwd()}`, (err, files) => {
                if (err) {
                    console.error(err);
                } else {
                    files.forEach(file => {
                        if (file.endsWith('.json') || file.endsWith('.jdl')) {
                            if (!excludedFiles.includes(file)) {
                                fs.unlink(`${process.cwd()}/${file}`, err => {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        console.log(`${file} removed`);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({ error: err.message });
        });
};

exports.infraJsonGenerator = body => {
    // set app folders, for container registry
    const applications = body.services;
    const applicationCount = Object.keys(applications).length;
    const appFolders = [];
    for (let i = 0; i < applicationCount; i++) {
        // Skip infra config if applicationFramework is docusaurus
        if (applications[i].applicationFramework.toLowerCase() !== 'docusaurus') {
            appFolders.push(applications[i].applicationName);
        }
    }
    var deployment = body.deployment;
    var cloudProvider = deployment.cloudProvider;
    var domainName = '';
    if (deployment.ingressDomain !== undefined) {
        domainName = deployment.ingressDomain;
    }

    // Iterate through applications and form appConfigs
    const appConfigs = Object.values(applications).map(serviceData => ({
        name: serviceData.applicationName,
        port: serviceData.serverPort,
        type: serviceData.applicationType,
    }));

    const auth = Object.values(applications).some(serviceData => serviceData.authenticationType === 'oauth2') ? 'true' : 'false';

    var infraJson = {
        projectId: body.projectId,
        projectName: body.projectName,
        cloudProvider: deployment.cloudProvider,
        domain: domainName,
        orchestration: deployment.deploymentType,
        clusterName: deployment.clusterName,
        kubernetesNamespace: deployment.kubernetesNamespace,
        ingress: deployment.ingressType,
        monitoring: 'false',
        enableECK: 'false',
        k8sWebUI: 'false',
        generateInfra: 'true',
        appFolders: appFolders,
        appConfigs: appConfigs,
        auth: auth,
    };
    infraJson.monitoring = deployment?.monitoring ?? infraJson.monitoring;
    infraJson.enableECK = deployment?.enableECK ?? infraJson.enableECK;
    infraJson.k8sWebUI = deployment?.k8sWebUI ?? infraJson.k8sWebUI;
    if (deployment.cloudProvider === 'aws') {
        infraJson.awsAccountId = deployment.awsAccountId;
        infraJson.awsRegion = deployment.awsRegion;
    } else if (deployment.cloudProvider === 'azure') {
        infraJson.subscriptionId = deployment.subscriptionId;
        infraJson.tenantId = deployment.tenantId;
        infraJson.location = deployment.location;
    }

    var infraJsonForLocalDeployment = {
        projectId: body.projectId,
        projectName: body.projectName,
        cloudProvider: deployment.cloudProvider,
        orchestration: 'kubernetes',
        kubernetesNamespace: deployment.kubernetesNamespace,
        ingress: deployment.ingressType,
        dockerRepositoryName: deployment.dockerRepositoryName,
        monitoring: 'false',
        enableECK: 'false',
        auth: auth,
    };
    infraJsonForLocalDeployment.monitoring = deployment?.monitoring ?? infraJsonForLocalDeployment.monitoring;
    infraJsonForLocalDeployment.enableECK = deployment?.enableECK ?? infraJsonForLocalDeployment.enableECK;

    return cloudProvider == 'minikube' ? infraJsonForLocalDeployment : infraJson;
};

exports.generateProjectId = (projectName, fileName) => {
    if (!fileName) fileName = nanoid(9);
    var projectId = projectName.replace(/\s/g, '').toLowerCase();
    projectId = projectId + '-' + fileName;
    return projectId;
};

exports.removeDump = folderPath => {
    // Remove the folder once the archive is complete.
    fs.rm(folderPath, { recursive: true }, err => {
        if (err) {
            console.error(err);
        } else {
            console.log(folderPath, 'Directory removed');
        }
    });

    // Remove all .json and .jdl files except [ "package.json", "package-lock.json" ,"wdi-wda-example.json", "reminder.jdl" ]
    const excludedFiles = ['package.json', 'package-lock.json', 'wdi-wda-example.json', 'reminder.jdl'];
    fs.readdir(`${process.cwd()}`, (err, files) => {
        if (err) {
            console.error(err);
        } else {
            files.forEach(file => {
                if (file.endsWith('.json') || file.endsWith('.jdl')) {
                    if (!excludedFiles.includes(file)) {
                        fs.unlink(`${process.cwd()}/${file}`, err => {
                            if (err) {
                                console.error(err);
                            } else {
                                console.log(`${file} removed`);
                            }
                        });
                    }
                }
            });
        }
    });
};
