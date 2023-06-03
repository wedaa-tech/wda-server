const { nanoid } = require("nanoid");
const utility = require('../utility/core');
const jdlConverter = require('../utility/jsonToJdl');
const exec = require("child_process").exec;
const blueprintDao = require('../dao/blueprintDao');

exports.test = function (req, res) {
    return res.status(200).send({ message: "Test API for wda server" });
};


/**
 * Get specific blueprint with given project Id
 * @param {*} req 
 * @param {*} res 
 */
exports.getBlueprint = function (req, res) {
  blueprintDao.getByProjectId({project_id: req.params.project_id})
  .then(result => {
    console.log("Retrieved blueprint:", result);
    if (Array.isArray(result) && result.length === 1) {
        var uniqueResult = result[0];
        return res.status(200).send(uniqueResult);
      } else {
        return res.status(200).send({result});
      }
  })
  .catch(error => {
    console.error("Error retrieving blueprint:", error);
    return res.status(500).send({ message: "Error retrieving blueprint" });
  });
};

/**
 * Get all blueprints with given user Id
 * @param {*} req 
 * @param {*} res 
 */
exports.getBlueprints = function (req, res) {
    blueprintDao.getByUserId({user_id: req.params.user_id})
    .then(results => {
      console.log("Retrieved blueprints:", results);
      return res.status(200).send(results);
    })
    .catch(error => {
      console.error("Error retrieving blueprints:", error);
      return res.status(500).send({ message: "Error retrieving blueprints" });
    });
  };

/**
 * generates services/infrastructure code from blueprint
 * @param {*} req 
 * @param {*} res 
 */
exports.generate = function (req, res) {
    const body = req.body;
    // console.log(body)

    console.log(
        "Hi",
        "Your project Name is",
        body.projectName
    );

    const fileName = nanoid(9);
    body.projectName = body.projectName + "-" + fileName; // To over ride the frontend value (and to maintain unique folder name)

    // Generates the Dir for Blueprints 
    utility.generateBlueprint(body.projectName, fileName, res);

    // preprocessing the request json 
    var deployment = false;
    if(body.deployment !== undefined) {
        deployment = true

        // prepare infra json for tf-wdi
        var infaJson = {
            cloudProvider: body.deployment.cloudProvider,

            domain: body.deployment.ingressDomain,
            orchestration: body.deployment.deploymentType,
            clusterName: body.deployment.clusterName,

        };
    }

    // Create a json file for the jhipster generator
    utility.createJsonFile(fileName, body);

    // persist the blueprint to DB
    var blueprint = {
        project_id: body.projectName,
        request_json: body,
        main_json: body
    };

    blueprintDao.create(blueprint)
    .then(savedBlueprint => {
        console.log("Blueprint was added successfully!");
    })
    .catch(error => {
        console.error(error);
    });

    // JSON to JDL, with 5 sec wait for the json to get generated 
    setTimeout(function () {
        console.log('Waiting 5 sec for the jdl to be generated');
        const response = jdlConverter.createJdlFromJson(fileName, res);
        // check if the error response object exists before returning it
        if (response) {
            return response;
        }

        // Child process to generate the architecture
        console.log("Generating Architecture files...");
        exec(
            `cd ${body.projectName} && jhipster jdl ../${fileName}.jdl --skip-install --skip-git --no-insight --skip-jhipster-dependencies`,
            function (error, stdout, stderr) {
                if (stdout !== "") {
                    console.log("---------stdout: ---------\n" + stdout);
                }

                if (stderr !== "") {
                    console.log("---------stderr: ---------\n" + stderr);
                }

                if (error !== null) {
                    console.log("---------exec error: ---------\n[" + error + "]");
                }

                console.log("Architecture Generation completed successfully.....");

                const folderPath = `./${body.projectName}`;

                // If generateInfra is true, then generate Terraform files as well and then generate the zip archive.
                if (false) {
                    console.log("Generating Infrastructure files...");

                    body.wdi.projectName = req.query.projectName + "-" + fileName;


                    const jsonFileForTerrafrom = nanoid(9);
                    body.wdi.generateInfra = generateInfra;

                    // Collect the appsFolders to create the ECR repositories, if cloud provider is AWS
                    body.wdi.appFolders = appsFolders;

                    //Below method will generate json file for the req.body.wdi, if generateInfra is true
                    createJsonFile(jsonFileForTerrafrom, req.body.wdi);

                    generateTerrafromFiles(jsonFileForTerrafrom, folderPath, res);

                    console.log(
                        "Zipping Architecture/Infrastructure files completed successfully....."
                    );
                } else {
                    // Generation of Architecture zip, with in the call back function of child process.
                    utility.generateZip(folderPath, res);
                    console.log("Zipping Architecture files completed successfully.....");
                }
            }
        );

    }, 5000);


};
