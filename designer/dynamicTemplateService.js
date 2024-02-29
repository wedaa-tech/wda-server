const path = require('path');
const fs = require('fs');
const { time } = require('console');


const serviceBase = {
    "nodes": {},
    "edges": {}
}

/**
 * Get AI powered dynamic template
 * @param {*} req
 * @param {*} res
 */
exports.getDynamicTemplate = function (req, res) {
    // TODO: logic to validate the incoming request json

    const dynamicTemplateRequest = req.body

    const projectTitle = dynamicTemplateRequest.title;
    const description = dynamicTemplateRequest.description;

    const services = dynamicTemplateRequest.services;
    const serviceCount = services.length;

    const serviceFramework = dynamicTemplateRequest?.serviceFramework ?? "spring";
    const database = dynamicTemplateRequest?.database ?? "postgresql";

    // Common services
    const clientFramework = dynamicTemplateRequest?.clientFramework ?? "react";
    const authentication = dynamicTemplateRequest?.authentication ?? "keycloak";
    const serviceDiscovery = dynamicTemplateRequest?.serviceDiscovery ?? "eureka";
    const logManagement = dynamicTemplateRequest?.logManagement ?? "eck";
    const rootPackageName = dynamicTemplateRequest?.rootPackageName ?? `com.${dynamicTemplateRequest.title.replace(/\s/g, '').toLowerCase()}`;

    const dynamicNodes = {};
    const dynamicEdges = {};


    let yaxis = 60;
    let servicePort = 9020;
    let clientPort = 4200;
    let mongoDatabasePort = 27017;
    let postgresqlDatabasePort = 5432;

    // Add UI blocks
    addClientNodes(dynamicNodes, clientFramework, clientPort, serviceCount);

    // Add service blocks
    for (let i = 0; i < serviceCount; i++) {
        const reactFlowServiceKey = `Service_${i + 1}`;

        let databasePort;
        if (database === "postgresql") {
            databasePort = postgresqlDatabasePort++;
        } else if (database === "mongodb") {
            databasePort = mongoDatabasePort++;
        }

        dynamicNodes[reactFlowServiceKey] = {
            "id": reactFlowServiceKey,
            "type": "ResizableNode",
            "position": {
                "x": 460,
                "y": yaxis
            },
            "data": {
                "applicationFramework": serviceFramework,
                "prodDatabaseType": database,
                "databasePort": databasePort.toString(),
                "Id": reactFlowServiceKey,
                "label": services[i].name,
                "applicationName": services[i].name.replace(/\s/g, '').toLowerCase(),
                "packageName": `${rootPackageName}.${services[i].name.replace(/\s/g, '').toLowerCase()}`,
                "serverPort": servicePort.toString(),
                "description": services[i].description,
                "applicationType": "microservice",
                "authenticationType": "oauth2",
                "serviceDiscoveryType": "eureka",
                "logManagementType": "eck",
            },
            "style": {
                "border": "1px solid black",
                "width": "120px",
                "height": "40px",
                "borderRadius": "15px"
            },
            "selected": false,
            "positionAbsolute": {
                "x": 460,
                "y": yaxis
            },
            "dragging": true
        };

        // database nodes logic 
        const reactFlowDatabaseKey = `Database_${i + 1}`;
        dynamicNodes[reactFlowDatabaseKey] = {
            "id": reactFlowDatabaseKey,
            "type": "selectorNode",
            "position": {
                "x": 660,
                "y": yaxis
            },
            "data": {
                "prodDatabaseType": database,
                "databasePort": databasePort.toString(),
                "isConnected": true
            },
            "style": {
                "border": "1px solid black",
                "padding": "4px 4px",
                "width": "120px",
                "height": "40px",
                "borderRadius": "15px"
            },
            "selected": false,
            "positionAbsolute": {
                "x": 660,
                "y": yaxis
            },
            "dragging": true
        }

        // service to database edge node logic 
        const reactFlowServiceToDatabaseKey = `${reactFlowServiceKey}-${reactFlowDatabaseKey}`;
        dynamicEdges[reactFlowServiceToDatabaseKey] = {
            "id": reactFlowServiceToDatabaseKey,
            "source": reactFlowServiceKey,
            "sourceHandle": "source.Right",
            "target": reactFlowDatabaseKey,
            "targetHandle": "target.Left",
            "markerEnd": {
                "color": "black",
                "type": "arrowclosed"
            },
            "type": "smoothstep",
            "data": {},
            "style": {
                "stroke": "black"
            }
        }

        // client to service edge node logic 
        let reactFlowclientToServiceKey = `UI_1-${reactFlowServiceKey}`;
        dynamicEdges[reactFlowclientToServiceKey] = {
            "id": reactFlowclientToServiceKey,
            "source": "UI_1",
            "sourceHandle": "source.Right",
            "target": reactFlowServiceKey,
            "targetHandle": "target.Left",
            "markerEnd": {
                "color": "#000",
                "type": "arrowclosed"
            },
            "type": "smoothstep",
            "data": {
                "client": "webapp",
                "server": services[i].name.replace(/\s/g, '').toLowerCase(),
                "type": "synchronous",
                "framework": "rest-api"
            },
            "style": {
                "stroke": "black"
            }
        }

        // UI nodes logic 
        // common services logic 
        yaxis += 60;
        servicePort += 1;
    }

    // Add the common service to the dynamicNodes
    addCommonServices(dynamicNodes);

    // Add service_group node
    addServicesGroupNode(dynamicNodes, yaxis);


    // Update the serviceBase nodes with the dynamicNodes
    serviceBase.nodes = dynamicNodes;
    serviceBase.edges = dynamicEdges;


    return res.json(serviceBase);
}

// TODO: addCommonServices --> chnage to dynamic generation function
/**
 * This method statically add's the common services to the dynamicNodes
 * @param {*} dynamicNodes 
 */
function addCommonServices(dynamicNodes) {
    var filePath = path.join(
        __dirname,
        '..',
        'resources/wizard/dynamicTemplate',
        `common_services.json`,
    );

    // Read the file content synchronously
    var commonServices;
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        commonServices = JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading or parsing the JSON file:', error.message);
    }

    dynamicNodes["group_1"] = commonServices["group_1"];
    dynamicNodes["authenticationType"] = commonServices["authenticationType"];
    dynamicNodes["serviceDiscoveryType"] = commonServices["serviceDiscoveryType"];
    dynamicNodes["logManagement"] = commonServices["logManagement"];
}

/**
 * 
 * @param {*} dynamicNodes 
 * @param {*} yaxis : This will allow to dynamically increase the hight of the group based on application nodes yaxis
 */
function addServicesGroupNode(dynamicNodes, yaxis) {
    let xaxisGroup = 430
    for (let i = 0; i < 2; i++) {
        let reactFlowGroupKey = `group_${i + 2}`;
        let groupLabel;
        if (reactFlowGroupKey === "group_2") {
            groupLabel = "application services"
        } else if (reactFlowGroupKey === "group_3") {
            groupLabel = "database services"
        }
        dynamicNodes[reactFlowGroupKey] = {
            "id": reactFlowGroupKey,
            "type": "GroupNode",
            "position": {
                "x": xaxisGroup,
                "y": 10
            },
            "data": {
                "label": groupLabel,
                "Id": reactFlowGroupKey,
                "type": "Group",
                "groupName": groupLabel,
            },
            "style": {
                "border": "1px dashed",
                "borderRadius": "15px",
                "width": 180,
                "height": yaxis + 10,
                "zIndex": -1
            },
            "selected": false,
            "positionAbsolute": {
                "x": xaxisGroup,
                "y": 10
            },
            "dragging": true
        }
        xaxisGroup += 200
    }
}

function addClientNodes(dynamicNodes, clientFramework, clientPort, serviceCount) {
    const clientCount = 1; // as of now client count is 1.

    // calculating the mean of the services to place clinet
    const yaxisClinet = (60 + (60 * serviceCount)) / 2;

    for (let i = 0; i < clientCount; i++) {
        const reactFlowClientKey = `UI_${i + 1}`;
        dynamicNodes[reactFlowClientKey] = {
            "id": reactFlowClientKey,
            "type": "ResizableNode",
            "position": {
                "x": 230,
                "y": yaxisClinet
            },
            "data": {
                "clientFramework": clientFramework,
                "applicationFramework": clientFramework,
                "packageName": "ui",
                "Id": reactFlowClientKey,
                "label": "webapp",
                "applicationName": "webapp",
                "serverPort": clientPort.toString(),
                "withExample": "false",
                "applicationType": "gateway",
                "theme": "",
                "authenticationType": "oauth2"
            },
            "style": {
                "border": "1px solid black",
                "width": "120px",
                "height": "40px",
                "borderRadius": "15px"
            },
            "selected": false,
            "positionAbsolute": {
                "x": 230,
                "y": yaxisClinet
            },
            "dragging": true
        };
    }

}


