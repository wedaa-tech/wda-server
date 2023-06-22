const { nanoid } = require("nanoid");
const utility = require('../utility/core');
const jdlConverter = require('../utility/jsonToJdl');
const exec = require("child_process").exec;
const blueprintDao = require('../dao/blueprintDao');

/**
 * Get specific blueprint with given project Id
 * @param {*} req 
 * @param {*} res 
 */
exports.getBlueprint = function (req, res) {
  const userId = req.kauth.grant.access_token.content.sub;
  blueprintDao.getByProjectId({project_id: req.params.project_id})
  .then(result => {
    if (Array.isArray(result) && result.length === 1) {
        var uniqueResult = result[0];
        console.log("Retrieved blueprint with project Id: "+ uniqueResult.project_id + ", for the user: " + userId); 
        return res.status(200).send(uniqueResult);
      } else {
        console.log("Retrieved blueprint with project Id: "+ result.project_id + ", for the user: " + userId); 
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
    const userId = req.kauth.grant.access_token.content.sub;
    blueprintDao.getByUserId({user_id: userId})
    .then(results => {
      console.log("Retrieved blueprints of user:", userId);
      return res.status(200).json({data:results});
    })
    .catch(error => {
      console.error("Error retrieving blueprints:", error);
      return res.status(500).send({ message: "Error retrieving blueprints" });
    });
  };

/**
 * Save delete the blueprint with given project Id
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteBlueprint = function (req, res) {
  blueprintDao.getByProjectId({project_id: req.params.project_id})
  .then(result => {
    if (Array.isArray(result) && result.length === 1) {
      blueprintDao.deleteByProjectId({ project_id: req.params.project_id })
        .then(result => {
          return res.status(200).send({ message: "Blueprint deleted successfully" });
        })
        .catch(error => {
          console.error("Error while deleting blueprint:", error);
          return res.status(500).send({ message: "Error while deleting blueprint" });
        });
    } else {
      console.log("No blueprint is present with project Id: "+ req.params.project_id); 
      return res.status(204);
    }
  })
  .catch(error => {
    console.error("Error retrieving blueprint:", error);
    return res.status(500).send({ message: "Error retrieving blueprint" });
  });
};

/**
 * generates services/infrastructure code from blueprint
 * @param {*} req 
 * @param {*} res 
 */
exports.generate = function (req, res) {
    const body = req.body;
    const userId = req.kauth.grant.access_token.content.sub;
    console.log(
      "Generating project: " + body.projectName + 
      ", for user: " + userId
    );

    const fileName = nanoid(9);
    body.projectId = body.projectName + "-" + fileName; // To over ride the frontend value (and to maintain unique folder name)
    const metadata = body.metadata;
    // preprocessing the request json 
    var deployment = false;
    if(body.deployment !== undefined) {
        deployment = true;
        body.deployment.projectName = body.projectName;
    }

    // Generates the Dir for Blueprints 
    utility.generateBlueprint(body.projectId, res);

    // Delete the "metadata" attribute from the JSON data
    delete body.metadata;

    // Validate & Create a json file for the jhipster generator 
    utility.createJsonFile(fileName, body);

    // JSON to JDL, with 5 sec wait for the json to get generated 
    setTimeout(function () {
        console.log('Waiting 5 sec for the jdl to be generated');
        const response = jdlConverter.createJdlFromJson(fileName, metadata, req, res);
        // check if the error response object exists before returning it
        if (response) {
            return response;
        }
        // Check if deployment type is minikube
        var minikube = "";
        if(body.deployment.cloudProvider === "minikube"){
          minikube = "--minikube";
        }

        // Child process to generate the architecture
        console.log("Generating Architecture files...");
        exec(
            `cd ${body.projectId} && jhipster jdl ../${fileName}.jdl --skip-install --skip-git --no-insight --skip-jhipster-dependencies ${minikube}`,
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

                const folderPath = `./${body.projectId}`;

                // If deployment is true, then generate Terraform files as well and then generate the zip archive.
                if (deployment) {
                    console.log("Generating Infrastructure files...");
                    const jsonFileForTerraform = nanoid(9);
                    
                    var infraJson = utility.infraJsonGenerator(body);
                    // Generate json file for infraJson, if deployment is true
                    utility.createJsonFile(jsonFileForTerraform, infraJson);

                    generateTerraformFiles(jsonFileForTerraform, folderPath, res);

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

/**
 * Child process to generate the Infrastructure files
 *
 * @param {*} fileName : random string with 9 characters
 * @param {*} folderPath : combination of the projectName +fileName
 * @param {*} res  : response to be sent to the user
 */
const generateTerraformFiles = (fileName, folderPath, res) => {
    exec(`yo tf-wdi --file ./${fileName}.json`, function (
      error,
      stdout,
      stderr
    ) {
      if (stdout !== "") {
        console.log("---------stdout: ---------\n" + stdout);
      }
  
      if (stderr !== "") {
        console.log("---------stderr: ---------\n" + stderr);
      }
  
      if (error !== null) {
        console.log("---------exec error: ---------\n[" + error + "]");
      }
  
      // Generation of Infrastructure zip file with in the callback function of child process.
      utility.generateZip(folderPath, res);
    });
  };
