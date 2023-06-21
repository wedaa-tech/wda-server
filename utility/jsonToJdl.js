const blueprintDao = require('../dao/blueprintDao');
const fs = require("fs");


exports.createJdlFromJson = (fileName, metadata, req, res) => {
    console.log("processing json to jdl with the file name:", fileName);

    // read the JSON file
    const jsonData = JSON.parse(fs.readFileSync(fileName + '.json', 'utf8'));

    // Applications
    const applications = jsonData.services;

    const applicationCount = Object.keys(applications).length;
    const appData = [];

    // below attributes are conditionally checked and added to jdl file commonly to all application blocks
    var logManagementType = false;
    var serviceDiscoveryType = false;

    var blueprints = ["go", "gomicro"];
    var clientFrameworks = ["react", "angular"];
    var serviceDiscoveryTypes = ["eureka", "consul"]
    var messageBrokers = ["rabbitmq", "kafka"];
    var databaseTypes = ["postgresql", "mysql", "mongodb"];
    var logManagementTypes = ["eck"];


    for (let i = 0; i < applicationCount; i++) {
        var applicationError = new Map();
        var applicationErrorList = [];
        // Error handling
        if (applications[i].applicationName === undefined || applications[i].applicationName === "") {
            applicationErrorList.push("Service Name cannot be empty");
        }
        if (applications[i].applicationType === undefined || applications[i].applicationType === "") {
            applicationErrorList.push("Service Type cannot be empty");
        }
        if (applications[i].packageName === undefined || applications[i].packageName === "") {
            applicationErrorList.push("Package Name cannot be empty");
        }
        if (applications[i].authenticationType === undefined || applications[i].authenticationType === "") {
            applicationErrorList.push("Authentication Type cannot be empty");
        }
        if (applications[i].prodDatabaseType !== undefined && !databaseTypes.includes(applications[i].prodDatabaseType)) {
            applicationErrorList.push("Unknow Database Type, database must be among the following: " + databaseTypes);
        }
        if (applications[i].serverPort === undefined || applications[i].serverPort === "") {
            applicationErrorList.push("Server Port cannot be empty");
        }

        // return error response
        if (applicationErrorList.length > 0) {
            applicationError[i] = applicationErrorList;
            console.log(applicationError);
            return res.status(400).send(applicationError);
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
        if (applications[i].applicationType !== undefined && applications[i].applicationType.toLowerCase() === "gateway" &&
            applications[i].withExample !== undefined && applications[i].withExample === "true") {
            withExample = true;
        }
        if (applications[i].applicationType !== undefined && applications[i].applicationType.toLowerCase() === "gateway" &&
            applications[i].clientFramework !== undefined && clientFrameworks.includes(applications[i].clientFramework)) {
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
            databaseType = "no";
        }
        if (applications[i].prodDatabaseType !== undefined && applications[i].prodDatabaseType.toLowerCase() === "mongodb") {
            databaseType = "mongodb";
        }
        if (applications[i].prodDatabaseType !== undefined && applications[i].prodDatabaseType.toLowerCase() !== "mongodb"
            && databaseTypes.includes(applications[i].prodDatabaseType)) {
            databaseType = "sql";
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
        ${databaseType === "no" ? 'databaseType no\n        prodDatabaseType no' : ''}
        ${databaseType === "mongodb" ? 'databaseType mongodb' : ''}
        ${databaseType === "sql" ? `databaseType sql\n        devDatabaseType ${applications[i].prodDatabaseType.toLowerCase()}\n        prodDatabaseType ${applications[i].prodDatabaseType.toLowerCase()}` : ''}
        ${messageBroker ? `messageBroker ${applications[i].messageBroker.toLowerCase()}` : ''}
        ${logManagementType ? `logManagementType ${applications[i].logManagementType.toLowerCase()}` : ''}
        ${serviceDiscoveryType ? `serviceDiscoveryType ${applications[i].serviceDiscoveryType.toLowerCase()}` : ''}
        ${clientFramework ? `clientFramework ${applications[i].clientFramework.toLowerCase()}` : ''}
        ${appFramework ? `blueprint [${applications[i].applicationFramework.toLowerCase()}]` : ''}
        ${withExample ? `withExample true` : ''}
    }
}
    
`;
        data = data.replace(/^\s*[\r\n]/gm, ''); // remove extra lines from jdl data
        appData.push(data);
    }

    // Communications
    const communications = jsonData.communications;
    const communicationData = [];
    const communicationBrokers = ['rabbitmq', 'rest-api'];
    if (communications !== undefined) {
        const communicationCount = Object.keys(communications).length;
        for (let i = 0; i < communicationCount; i++) {
            if (communications[i].client !== "" && communications[i].server !== "" && communicationBrokers.includes(communications[i].framework.toLowerCase())) {
                const data = `
communication {
    client "${communications[i].client.toLowerCase()}"
    server "${communications[i].server.toLowerCase()}"
    ${communications[i].type.toLowerCase() === "asynchronous" ? `type "async"` : `type "sync"`}
    framework "${communications[i].framework.toLowerCase()}"
}

`;
                communicationData.push(data);
            }
            else{
                console.log("communication framework is not supported, must below to one of the following: " + communicationBrokers);
                return res.status(400).send("communication framework is not supported, must below to one of the following: " + communicationBrokers);
            }
        }
    }

    // Deployment 
    const deployment = jsonData.deployment;
    var deploymentData;
    if (deployment !== undefined) {
        // Error handling
        let deploymentError = [];
        if (deployment.cloudProvider === undefined || deployment.cloudProvider === "") {
            deploymentError.push("Cloud provider cannot be empty");
        }
        if (deployment.cloudProvider !== undefined) {
            if (deployment.cloudProvider === "aws") {
                if (deployment.awsAccountId === undefined || deployment.awsAccountId === "") {
                    deploymentError.push("AWS account id cannot be empty");
                }
                if (deployment.awsRegion === undefined || deployment.awsRegion === "") {
                    deploymentError.push("AWS region cannot be empty");
                }
            } else if (deployment.cloudProvider === "azure") {
                if (deployment.subscriptionId === undefined || deployment.subscriptionId === "") {
                    deploymentError.push("Azure subscription id cannot be empty");
                }
                if (deployment.tenantId === undefined || deployment.tenantId === "") {
                    deploymentError.push("Azure tenant id cannot be empty");
                }
            }
        }
        if (deployment.deploymentType === undefined || deployment.deploymentType === "") {
            deploymentError.push("Deployment Type cannot be empty");
        }
        if (deployment.clusterName === undefined || deployment.clusterName === "") {
            deploymentError.push("Cluster Name cannot be empty");
        }
        if (deployment.ingressDomain === undefined || deployment.ingressDomain === "") {
            deploymentError.push("Ingress Domain cannot be empty");
        }
        if (deployment.ingressType === undefined || deployment.ingressType === "") {
            deploymentError.push("Ingress Type cannot be empty");
        }
        if ((deployment.kubernetesUseDynamicStorage !== undefined && deployment.kubernetesUseDynamicStorage === true)
            && (deployment.kubernetesStorageClassName === undefined || deployment.kubernetesStorageClassName === "")) {
            deploymentError.push("Storage Class Name cannot be empty");
        }

        // return error response
        if (deploymentError.length > 0) {
            console.log(deploymentError);
            return res.status(400).send(deploymentError);
        }

        // preprocessing deployment block, before jdl generation

        // set apps folders 
        const appsFolders = [];
        for (let i = 0; i < applicationCount; i++) {
            appsFolders.push(applications[i].applicationName.toLowerCase());
        }

        // set repository name based on cloud provider
        var dockerRepositoryName;
        if (deployment.cloudProvider === "aws") {
            dockerRepositoryName = `${deployment.awsAccountId}.dkr.ecr.${deployment.awsRegion}.amazonaws.com`;
        } else if (deployment.cloudProvider === "azure") {
            dockerRepositoryName = `acr${deployment.projectName}.azurecr.io`;
        }

        // set kubernetesServiceType to Ingress if ingressType is istio
        let ingressType = false;
        if (deployment.ingressType === "istio") {
            ingressType = true;
        }

        // set serviceDiscoveryType if only present
        let serviceDiscoveryType = false;
        if (deployment.serviceDiscoveryType !== undefined && deployment.serviceDiscoveryType !== "") {
            serviceDiscoveryType = true;
        }

        // set kubernetesUseDynamicStorage if only present
        let dynamicStorage = false;
        if (deployment.kubernetesUseDynamicStorage !== undefined && deployment.kubernetesUseDynamicStorage === "true") {
            dynamicStorage = true;
        }

        // Conversion of json to jdl (Deployment Options)
        deploymentData = `
deployment {
    deploymentType ${deployment.deploymentType.toLowerCase()}
    appsFolders [${appsFolders}]
    dockerRepositoryName "${dockerRepositoryName.toLowerCase()}"
    kubernetesNamespace ${deployment.kubernetesNamespace.toLowerCase()}
    ${serviceDiscoveryType ? `serviceDiscoveryType ${deployment.serviceDiscoveryType.toLowerCase()}` : `serviceDiscoveryType no`}
    ${ingressType ? `kubernetesServiceType Ingress` : `kubernetesServiceType LoadBalancer`}
    ${ingressType ? `istio true` : `istio false`}
    ingressDomain "${deployment.ingressDomain.toLowerCase()}"
    ${dynamicStorage ? `kubernetesUseDynamicStorage ${deployment.kubernetesUseDynamicStorage.toLowerCase()}` : ''}
    ${dynamicStorage && deployment.kubernetesStorageClassName !== undefined ? `kubernetesStorageClassName "${deployment.kubernetesStorageClassName.toLowerCase()}"` : ''}
    ${dynamicStorage && deployment.cloudProvider === "aws" ? `kubernetesStorageProvisioner "ebs.csi.aws.com"` : ''}
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
    const combinedArrayData = Array.from(combinedData);
    const concatenatedJDL = combinedArrayData.join(' ');

    // persist the blueprint to DB, if there is no error 
    var blueprint = {
        project_id: jsonData.projectId,
        request_json: jsonData,
        metadata: metadata,
        user_id: req.kauth.grant.access_token.content.sub
    };
    blueprintDao.create(blueprint)
        .then(savedBlueprint => {
            console.log("Blueprint was added successfully!");
        })
        .catch(error => {
            console.error(error);
        });

    fs.writeFile(fileName + '.jdl', concatenatedJDL, (err) => {
        if (err) throw err;
        console.log('Json data written to JDL file');
        fs.writeFile(`${jsonData.projectId}/blueprints/apps-blueprint.jdl`,
            concatenatedJDL,
            (err) => {
                if (err) throw err;
            }
        );
    });
};
