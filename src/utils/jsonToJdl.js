const fs = require('fs');
const { prepareEntityData } = require('./dbmlParser/dbmlToJson');
const { getTableNames, getDuplicateTableNames } = require('./dbmlParser/helper.js');
const { checkFlagsEnabled } = require('../configs/feature-flag.js');
const { randomStringGenerator, capitalizeName, toCamelCase } = require('./helper.js');

exports.createJdlFromJson = async (fileName, metadata, req, res) => {
    console.log('processing json to jdl with the file name:', fileName);
    // TODO: Error Hanlding should be taken care if there is problem with flagsmith
    const jdlEntitiesEnabled = await checkFlagsEnabled('jdl_entities');

    // read the JSON file
    const jsonData = JSON.parse(fs.readFileSync(fileName + '.json', 'utf8'));

    // Applications
    const applications = jsonData.services;

    const applicationCount = Object.keys(applications).length;
    const appData = [];

    // below attributes are conditionally checked and added to jdl file commonly to all application blocks
    var logManagementType = false;
    var serviceDiscoveryType = false;

    var blueprints = ['go', 'gomicro', 'react', 'angular', 'vue', 'fastapi'];
    var clientFrameworks = ['react', 'angular', 'vue'];
    var serviceDiscoveryTypes = ['eureka', 'consul'];
    var messageBrokers = ['rabbitmq', 'kafka'];
    var databaseTypes = ['postgresql', 'mysql', 'mongodb'];
    var logManagementTypes = ['eck'];

    // Get the Duplicate Table/Entity Names form the DBML script if any.
    duplicateEntities = getDuplicateTableNames(applications);

    for (let i = 0; i < applicationCount; i++) {
        // Skip jdl config formation if applicationFramework is docusaurus
        if (applications[i].applicationFramework !== undefined && applications[i].applicationFramework === 'docusaurus') {
            continue;
        }
        var applicationError = new Map();
        var applicationErrorList = [];
        // Error handling
        if (applications[i].applicationName === undefined || applications[i].applicationName === '') {
            applicationErrorList.push('Service Name cannot be empty');
        }
        if (applications[i].applicationType === undefined || applications[i].applicationType === '') {
            applicationErrorList.push('Service Type cannot be empty');
        }
        if (applications[i].packageName === undefined || applications[i].packageName === '') {
            applicationErrorList.push('Package Name cannot be empty');
        }
        if (applications[i].authenticationType === undefined || applications[i].authenticationType === '') {
            applicationErrorList.push('Authentication Type cannot be empty');
        }
        if (applications[i].prodDatabaseType !== undefined && !databaseTypes.includes(applications[i].prodDatabaseType)) {
            applicationErrorList.push('Unknow Database Type, database must be among the following: ' + databaseTypes);
        }
        if (applications[i].serverPort === undefined || applications[i].serverPort === '') {
            applicationErrorList.push('Server Port cannot be empty');
        }
        if (
            applications[i].prodDatabaseType !== undefined &&
            (applications[i].databasePort === undefined || applications[i].databasePort === '')
        ) {
            applicationErrorList.push('Database Port cannot be empty');
        }

        // throw error response
        if (applicationErrorList.length > 0) {
            applicationError[i] = applicationErrorList;
            console.err(applicationError);
            throw new Error(applicationError);
        }

        // below attributes are conditionally checked and added to jdl file in each application block
        var appFramework = false;
        var withExample = false;
        var clientFramework = false;
        var messageBroker = false;
        var databaseType = false;

        if (applications[i].applicationFramework !== undefined && blueprints.includes(applications[i].applicationFramework)) {
            appFramework = true;
        }
        if (
            applications[i].applicationType !== undefined &&
            applications[i].applicationType.toLowerCase() === 'gateway' &&
            applications[i].withExample !== undefined &&
            applications[i].withExample === 'true'
        ) {
            withExample = true;
        }
        if (
            applications[i].applicationType !== undefined &&
            applications[i].applicationType.toLowerCase() === 'gateway' &&
            applications[i].clientFramework !== undefined &&
            clientFrameworks.includes(applications[i].clientFramework)
        ) {
            clientFramework = true;
        }
        if (applications[i].serviceDiscoveryType !== undefined && serviceDiscoveryTypes.includes(applications[i].serviceDiscoveryType)) {
            serviceDiscoveryType = true;
        }
        if (applications[i].logManagementType !== undefined && logManagementTypes.includes(applications[i].logManagementType)) {
            logManagementType = true;
        }
        if (applications[i].messageBroker !== undefined && messageBrokers.includes(applications[i].messageBroker)) {
            messageBroker = true;
        }
        if (applications[i].prodDatabaseType === undefined) {
            databaseType = 'no';
        }
        if (applications[i].prodDatabaseType !== undefined && applications[i].prodDatabaseType.toLowerCase() === 'mongodb') {
            databaseType = 'mongodb';
        }
        if (
            applications[i].prodDatabaseType !== undefined &&
            applications[i].prodDatabaseType.toLowerCase() !== 'mongodb' &&
            databaseTypes.includes(applications[i].prodDatabaseType)
        ) {
            databaseType = 'sql';
        }

        // Adding randomString to the application, which might required for generating unique entities/relations.
        applications[i].suffix = randomStringGenerator(5);

        var entities, entitiesString;
        if (!clientFramework && applications[i].dbmlData != null) {
            entities = getTableNames(applications[i].dbmlData);

            // Iterate over entities and check for duplicates, if exist suffix random string to it.
            entities.forEach((entityName, index) => {
                if (duplicateEntities.includes(entityName)) {
                    // [Future Release]: Random suffix can be replaced with logical object in future.
                    entities[index] = `${entityName}${applications[i].suffix}`;
                }
            });

            entities.forEach((entity, index) => {
                entities[index] = capitalizeName(toCamelCase(entity));
            });

            entitiesString = entities.join(', ');
        }

        // Conversion of json to jdl (Application Options)
        var data = `
application {
    config {
        baseName ${applications[i].applicationName.toLowerCase()}
        applicationType ${applications[i].applicationType.toLowerCase()}
        packageName ${applications[i].packageName.toLowerCase()}
        authenticationType ${applications[i].authenticationType.toLowerCase()}
        serverPort ${applications[i].serverPort}
        ${databaseType === 'no' ? 'databaseType no\n        prodDatabaseType no' : ''}
        ${databaseType === 'mongodb' ? 'databaseType mongodb' : ''}
        ${
            databaseType === 'sql'
                ? `databaseType sql\n        devDatabaseType ${applications[
                      i
                  ].prodDatabaseType.toLowerCase()}\n        prodDatabaseType ${applications[i].prodDatabaseType.toLowerCase()}`
                : ''
        }
        ${databaseType !== 'no' ? `databasePort ${applications[i].databasePort}` : ''}
        ${messageBroker ? `messageBroker ${applications[i].messageBroker.toLowerCase()}` : ''}
        ${logManagementType ? `logManagementType ${applications[i].logManagementType.toLowerCase()}` : 'logManagementType no'}
        ${serviceDiscoveryType ? `serviceDiscoveryType ${applications[i].serviceDiscoveryType.toLowerCase()}` : 'serviceDiscoveryType no'}
        ${clientFramework ? `clientFramework ${applications[i].clientFramework.toLowerCase()}` : 'clientFramework no'}
        ${appFramework ? `blueprint [${applications[i].applicationFramework.toLowerCase()}]` : ''}
        ${withExample ? `withExample true` : ''}
    }
    ${!clientFramework && entitiesString && jdlEntitiesEnabled ? `entities ${entitiesString}` : ''}
}\n`;

        data = data.replace(/^\s*[\r\n]/gm, ''); // remove extra lines from jdl data
        data += '\n';
        appData.push(data);
    }

    // Communications
    const communications = jsonData.communications;
    const communicationData = [];
    const communicationBrokers = ['rabbitmq', 'rest-api'];
    if (communications !== undefined && communications !== null) {
        const communicationCount = Object.keys(communications).length;
        for (let i = 0; i < communicationCount; i++) {
            if (
                communications[i].client !== '' &&
                communications[i].server !== '' &&
                communicationBrokers.includes(communications[i].framework.toLowerCase())
            ) {
                const data = `
communication {
    client "${communications[i].client.toLowerCase()}"
    server "${communications[i].server.toLowerCase()}"
    ${communications[i].type.toLowerCase() === 'asynchronous' ? `type "async"` : `type "sync"`}
    framework "${communications[i].framework.toLowerCase()}"
}

`;
                communicationData.push(data);
            } else {
                // throw error response
                console.err('communication framework is not supported, must below to one of the following: ' + communicationBrokers);
                throw new Error('communication framework is not supported, must below to one of the following: ' + communicationBrokers);
            }
        }
    }

    // Deployment
    const deployment = jsonData.deployment;
    var deploymentData;
    if (deployment !== undefined && deployment !== null) {
        var deploymentTypes = ['kubernetes'];
        var cloudProviders = ['aws', 'azure'];
        var localProviders = ['minikube'];
        // Error handling
        let deploymentError = [];
        if (deployment.cloudProvider === undefined || deployment.cloudProvider === '') {
            deploymentError.push('Cloud provider cannot be empty');
        }
        if (deployment.cloudProvider !== undefined) {
            if (deployment.cloudProvider === 'aws') {
                if (deployment.awsAccountId === undefined || deployment.awsAccountId === '') {
                    deploymentError.push('AWS account id cannot be empty');
                }
                if (deployment.awsRegion === undefined || deployment.awsRegion === '') {
                    deploymentError.push('AWS region cannot be empty');
                }
            } else if (deployment.cloudProvider === 'azure') {
                if (deployment.subscriptionId === undefined || deployment.subscriptionId === '') {
                    deploymentError.push('Azure subscription id cannot be empty');
                }
                if (deployment.tenantId === undefined || deployment.tenantId === '') {
                    deploymentError.push('Azure tenant id cannot be empty');
                }
            }
        }
        if (cloudProviders.includes(deployment.cloudProvider)) {
            if (deployment.deploymentType === undefined || deployment.deploymentType === '') {
                deploymentError.push('Deployment Type cannot be empty');
            }
            if (deployment.clusterName === undefined || deployment.clusterName === '') {
                deploymentError.push('Cluster Name cannot be empty');
            }
            if (deployment.kubernetesNamespace === undefined || deployment.kubernetesNamespace === '') {
                deploymentError.push('Kubernetes namespace cannot be empty');
            }
            if (deployment.ingressType === undefined || deployment.ingressType === '') {
                deploymentError.push('Ingress Type cannot be empty');
            }
            if (
                deployment.kubernetesUseDynamicStorage !== undefined &&
                deployment.kubernetesUseDynamicStorage === true &&
                (deployment.kubernetesStorageClassName === undefined || deployment.kubernetesStorageClassName === '')
            ) {
                deploymentError.push('Storage Class Name cannot be empty');
            }
        } else if (localProviders.includes(deployment.cloudProvider)) {
            if (deployment.kubernetesNamespace === undefined || deployment.kubernetesNamespace === '') {
                deploymentError.push('Kubernetes namespace cannot be empty');
            }

            if (deployment.dockerRepositoryName === undefined || deployment.dockerRepositoryName === '') {
                deploymentError.push('docker repository cannot be empty');
            }
        }

        // throw error response
        if (deploymentError.length > 0) {
            console.err(deploymentError);
            throw new Error(deploymentError);
        }

        // preprocessing deployment block, before jdl generation

        // set apps folders
        const appsFolders = [];
        for (let i = 0; i < applicationCount; i++) {
            // Skip k8s config if applicationFramework is docusaurus
            if (applications[i].applicationFramework.toLowerCase() !== 'docusaurus') {
                appsFolders.push(applications[i].applicationName.toLowerCase());
            }
        }

        // set repository name based on cloud provider
        var dockerRepositoryName;
        if (deployment.cloudProvider === 'aws') {
            dockerRepositoryName = `${deployment.awsAccountId}.dkr.ecr.${deployment.awsRegion}.amazonaws.com`;
        } else if (deployment.cloudProvider === 'azure') {
            dockerRepositoryName = `acr${deployment.projectName}.azurecr.io`;
        } else if (deployment.cloudProvider === 'minikube') {
            dockerRepositoryName = deployment.dockerRepositoryName;
        }

        // set kubernetesServiceType to Ingress if ingressType is istio
        let ingressType = false;
        if (deployment.ingressType === 'istio' && deployment.ingressDomain !== undefined && deployment.ingressDomain !== '') {
            ingressType = true;
        }

        // set serviceDiscoveryType if only present
        let serviceDiscoveryType = false;
        if (deployment.serviceDiscoveryType !== undefined && deployment.serviceDiscoveryType !== '') {
            serviceDiscoveryType = true;
        }

        // set kubernetesUseDynamicStorage if only present
        let dynamicStorage = false;
        if (deployment.kubernetesUseDynamicStorage !== undefined && deployment.kubernetesUseDynamicStorage === 'true') {
            dynamicStorage = true;
        }

        // set deploymentType
        var deploymentType = 'kubernetes';
        if (deployment.deploymentType !== undefined && deploymentTypes.includes(deployment.deploymentType.toLowerCase())) {
            deploymentType = deployment.deploymentType.toLowerCase();
        }

        // set monitoring as istio for external-lb
        //[Future Release]: monitoring attribute should be changed to some other attribute,
        //                  else monitoring with prometheus provided by jhipster won't work.
        var monitoring = 'no';
        if (deployment.monitoring !== undefined && deployment.monitoring !== '' && deployment.monitoring === 'true') {
            monitoring = 'istio';
        }

        // Conversion of json to jdl (Deployment Options)
        deploymentData = `
deployment {
    deploymentType ${deploymentType}
    appsFolders [${appsFolders}]
    dockerRepositoryName "${dockerRepositoryName.toLowerCase()}"
    kubernetesNamespace ${deployment.kubernetesNamespace.toLowerCase()}
    ${serviceDiscoveryType ? `serviceDiscoveryType ${deployment.serviceDiscoveryType.toLowerCase()}` : `serviceDiscoveryType no`}
    ${ingressType ? `kubernetesServiceType Ingress` : `kubernetesServiceType LoadBalancer`}
    ${ingressType ? `istio true` : `istio false`}
    ${ingressType ? `ingressDomain "${deployment.ingressDomain.toLowerCase()}"` : ``}
    ${dynamicStorage ? `kubernetesUseDynamicStorage ${deployment.kubernetesUseDynamicStorage.toLowerCase()}` : ''}
    ${
        dynamicStorage && deployment.kubernetesStorageClassName !== undefined
            ? `kubernetesStorageClassName "${deployment.kubernetesStorageClassName.toLowerCase()}"`
            : ''
    }
    ${dynamicStorage && deployment.cloudProvider === 'aws' ? `kubernetesStorageProvisioner "ebs.csi.aws.com"` : ''}
    ${monitoring === 'istio' ? `monitoring istio` : `monitoring no`}
}

`;
        deploymentData = deploymentData.replace(/^\s*[\r\n]/gm, ''); // remove extra lines from jdl data
    }

    let combinedData = appData;
    if (communications !== undefined) {
        combinedData = combinedData.concat(communicationData);
    }
    if (deployment !== undefined) {
        combinedData = combinedData.concat(deploymentData);
    }

    //Entities
    if (jdlEntitiesEnabled) {
        entityData = prepareEntityData(applications);
        if (entityData !== undefined) {
            combinedData = combinedData.concat(entityData);
        }

        optionsData = `
use serviceClass, serviceImpl, pagination for *
`;

        if (optionsData !== undefined) {
            combinedData = combinedData.concat(optionsData);
        }
    }

    const combinedArrayData = Array.from(combinedData);
    const concatenatedJDL = combinedArrayData.join(' ');

    fs.writeFile(fileName + '.jdl', concatenatedJDL, err => {
        if (err) throw err;
        console.log('Json data written to JDL file');
        fs.writeFile(`${jsonData.projectId}/blueprints/apps-blueprint.jdl`, concatenatedJDL, err => {
            if (err) throw err;
        });
    });
};
