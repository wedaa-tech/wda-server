const { application } = require("express");
const fs = require("fs");


exports.createJdlFromJson = (fileName, res) => {
    console.log("processing json to jdl with the file name:", fileName);

    // read the JSON file
    const jsonData = JSON.parse(fs.readFileSync(fileName + '.json', 'utf8'));

    // applications
    const applications = jsonData.services;

    const applicationCount = Object.keys(applications).length;
    const appData = [];
    

    // below attributes are conditionally checked and added to jdl file commonly to all application blocks
    var logManagementType       = false;
    var serviceDiscoveryType    = false;


    // if(jsonData.wdi !== undefined && jsonData.wdi.enableECK === "true"){
    //     logManagementType ="eck";
    // }

    var blueprints              = [ "go"];
    var clientFrameworks        = [ "react", "angular" ];
    var serviceDiscoveryTypes   = [ "eureka", "consul"]
    var messageBrokers          = [ "rabbitmq", "kafka"];

    
    for (let i = 0; i < applicationCount; i++) {
        var applicationError = new Map();
        var applicationErrorList = [];

        // Error handling
        if (applications[i].applicationName === undefined || applications[i].applicationName === "") {
            applicationErrorList.push("Service Name cannot be empty");
        }
        if (applications[i].applicationType === undefined  || applications[i].applicationType === "") {
            applicationErrorList.push("Service Type cannot be empty");
        }
        if (applications[i].packageName === undefined  || applications[i].packageName === "") {
            applicationErrorList.push("Package Name cannot be empty");
        }
        if (applications[i].authenticationType === undefined  || applications[i].authenticationType === "") {
            applicationErrorList.push("Authentication Type cannot be empty");
        }
        if (applications[i].databaseType === undefined  || applications[i].databaseType === "") {
            applicationErrorList.push("Database cannot be empty");
        }
        if (applications[i].prodDatabaseType === undefined  || applications[i].prodDatabaseType === "") {
            applicationErrorList.push("Prod Database cannot be empty");
        }
        if (applications[i].serverPort === undefined  || applications[i].serverPort === "") {
            applicationErrorList.push("Server Port cannot be empty");
        }

        // return error response
        if (applicationErrorList.length > 0){
            applicationError[i] = applicationErrorList;
            console.log(applicationError);
            return res.status(406).send(applicationError);
        }

        // below attributes are conditionally checked and added to jdl file in each application block
        var appFramework            = false;
        var withExample             = false;
        var clientFramework         = false;
        var messageBroker           = false;

        if (applications[i].applicationFramework !== undefined && blueprints.includes(applications[i].applicationFramework)) {
            appFramework = true ;
        }
        if (applications[i].applicationType !== undefined && applications[i].applicationType.toLowerCase() === "gateway" && 
            applications[i].withExample !== undefined && applications[i].withExample === "true") {
            withExample = true;
        }
        if(applications[i].applicationType !== undefined && applications[i].applicationType.toLowerCase() === "gateway" && 
            applications[i].clientFramework !== undefined && clientFrameworks.includes(applications[i].clientFramework)){
            clientFramework = true;
        }
        if(applications[i].serviceDiscoveryType !== undefined &&  serviceDiscoveryTypes.includes(applications[i].serviceDiscoveryType)){
            serviceDiscoveryType = true;
        }
        if(applications[i].logManagementType !== undefined &&  applications[i].withExample === "eck"){
            logManagementType = true;
        }
        if(applications[i].messageBroker !== undefined && messageBrokers.includes(applications[i].messageBroker)){
            messageBroker = true;
        }

        // Conversion of json to jdl (Application Options)
        var data = `
application {
    config {
        baseName ${applications[i].applicationName.toLowerCase()}
        applicationType ${applications[i].applicationType.toLowerCase()}
        packageName ${applications[i].packageName.toLowerCase()}
        authenticationType ${applications[i].authenticationType.toLowerCase()}
        databaseType ${applications[i].databaseType.toLowerCase()}
        prodDatabaseType ${applications[i].prodDatabaseType.toLowerCase()}
        serverPort ${applications[i].serverPort}
        ${messageBroker ? `messageBroker ${applications[i].messageBroker.toLowerCase()}` : ''}
        ${logManagementType ? `logManagementType ${logManagementType.toLowerCase()}` : ''}
        ${serviceDiscoveryType ? `serviceDiscoveryType ${applications[i].serviceDiscoveryType.toLowerCase()}` : ''}
        ${clientFramework ? `clientFramework ${applications[i].clientFramework.toLowerCase()}` : ''}
        ${appFramework ? `blueprint [${applications[i].applicationFramework.toLowerCase()}]` : ''}
        ${withExample  ? `withExample true` : ''}
    }
}
    
`;
        data = data.replace(/^\s*[\r\n]/gm, ''); // remove extra lines from jdl data
        appData.push(data);
    }


    // Communications
//     const communications = jsonData.communication;
    const communicationData = [];
//     if(communications !== undefined){
//         const communicationCount = Object.keys(communications).length;
//         for (let i = 0; i < communicationCount; i++) {
//             if(communications[i].clientName !== "" && communications[i].serverName !== "") {
//             const data = `
// communication {
//     client "${communications[i].clientName.toLowerCase()}",
//     server "${communications[i].serverName.toLowerCase()}"
// }
    
// `;
//             communicationData.push(data);
//             }
//         }
// }


    // deployment 
//     const deployment = jsonData.deployment;
//     let deploymentError = [];
//     // Error handling
//     if (deployment.deploymentType === "") {
//         deploymentError.push("Deployment Type cannot be empty");
//     }
//     if (deployment.appsFolders === []) {
//         deploymentError.push("Application Folders cannot be empty");
//     }
//     if (deployment.dockerRepositoryName === "") {
//         deploymentError.push("Repository Name cannot be empty");
//     }
//     if (deployment.serviceDiscoveryType === "") {
//         deploymentError.push("Service discovery Type cannot be empty");
//     }
//     if (deployment.kubernetesServiceType === "") {
//         deploymentError.push("Kubernetes Service Type cannot be empty");
//     }
//     if (deployment.ingressDomain === "") {
//         deploymentError.push("Ingress Domain cannot be empty");
//     }
//     if (deployment.ingressType === "") {
//         deploymentError.push("Ingress Type cannot be empty");
//     }
//     if (deployment.kubernetesUseDynamicStorage === "") {
//         deploymentError.push("Use Dynamic Storage cannot be empty");
//     }
    
//     const deploymentData = `
// deployment {
//     deploymentType ${deployment.deploymentType.toLowerCase()}
//     appsFolders [${deployment.appsFolders}]
//     dockerRepositoryName "${deployment.dockerRepositoryName.toLowerCase()}"
//     kubernetesNamespace ${deployment.kubernetesNamespace.toLowerCase()}
//     serviceDiscoveryType ${deployment.serviceDiscoveryType.toLowerCase()}
//     istio ${deployment.istio.toLowerCase()}
//     ingressDomain "${deployment.ingressDomain.toLowerCase()}"
//     kubernetesUseDynamicStorage ${deployment.kubernetesUseDynamicStorage.toLowerCase()}
//     kubernetesStorageClassName "${deployment.kubernetesStorageClassName.toLowerCase()}"
//     kubernetesStorageProvisioner "${deployment.kubernetesStorageProvisioner.toLowerCase()}"
// }

// `;


    // const errorData = new Map();
    // if(applicationError.size > 0)
    //     errorData["applications"] = applicationError;
    // // if(communicationError.size > 0)
    // //     errorData["communication"] = communicationError;
    // // if(deploymentError.length > 0)
    // //     errorData["deployment"] = deploymentError;


    // // return error response
    // if (Object.keys(errorData).length >= 1){
    //     console.log(errorData);
    //     return res.status(400).send(errorData);
    // }


    // let combinedData = appData.concat(communicationData, deploymentData);
    let combinedData = appData.concat(communicationData);


    const combinedArrayData = Array.from(combinedData);
    const concatenatedJDL = combinedArrayData.join(' ');
    

    fs.writeFile(fileName + '.jdl', concatenatedJDL, (err) => {
        if (err) throw err;
        console.log('Json data written to JDL file');
            fs.writeFile(`${jsonData.projectName}/blueprints/apps-blueprint.jdl`,
            concatenatedJDL,
            (err) => {
            if (err) throw err;
            }
        );
    });
};
