const { nanoid } = require("nanoid");
const utility = require('../utility/core');
const jdlConverter = require('../utility/jsonToJdl');
const exec = require("child_process").exec;
const blueprintDao = require('../dao/blueprintDao');



/**
 * Update specific blueprint with given project Id
 * @param {*} req 
 * @param {*} res 
 */
exports.updateBlueprint = function (req, res) {
  const userId = req.kauth.grant.access_token.content.sub;
  const updatedData = {request_json:req.body.request_json,metadata:req.body.metadata}; 

  blueprintDao.update({ project_id: req.params.project_id }, updatedData)
  .then(result => {
    if(result == null)
    {
      console.log("No Data present with the given Id:"+req.params.project_id)
      return res.status(500).send({ message:"No Data present with the given Id:"+req.params.project_id})
    }
    else if (Array.isArray(result) && result.length === 1) {
      var uniqueResult = result[0];
      console.log("Updated blueprint with project Id: " + uniqueResult.project_id + ", for the user: " + userId);
      return res.status(200).send(uniqueResult);
    } else {
      console.log("Updated blueprint with project Id: " + result.project_id + ", for the user: " + userId);
      return res.status(200).send({ result });
    }
  })
  .catch(error => {
    console.error("Error updating blueprint:", error);
    return res.status(500).send({ message: "Error updating blueprint" });
  });
};

/**
 * Create or Save blueprint in the Database
 * @param {*} req 
 * @param {*} res 
 */
exports.saveAsDraft = function (req,res) {
  const userId = req.kauth.grant.access_token.content.sub;
  const blueprint = req.body;
  blueprintDao.create(blueprint)
  .then(savedBlueprint => {
      console.log("Blueprint was added successfully!");
      return res.sendStatus(200);
  })
  .catch(error => {
      console.error(error);
      return res.status(500).send({ message: "Error saving blueprint" });
  });
}

/**
 * Verify whether specific blueprint with given project Id belongs to the current user
 * @param {*} req 
 * @param {*} res 
 */
exports.verifyProject = function(req,res) {
  const userId = req.kauth.grant.access_token.content.sub;
  blueprintDao.getByProjectId({project_id: req.params.project_id})
  .then(result => {
    if (Array.isArray(result) && result.length === 1) {
        var uniqueResult = result[0];
        if(userId == uniqueResult.user_id){
          return res.sendStatus(200);
        }
        else{
          return res.sendStatus(204);
        }
      } 
      else {
        console.log("Retrieved blueprint with project Id: "+ result.project_id); 
        if(userId = result.user_id){
          return res.status(200).send();
        }
        else{
          return res.status(204).send();
        }
      }
  })
  .catch(error => {
    console.error("Error retrieving blueprint:", error);
    return res.status(500).send({ message: "Error retrieving blueprint" });
  });
}

/**
 * Get specific blueprint with given project Id
 * @param {*} req 
 * @param {*} res 
 */
exports.getBlueprint = function (req, res) {
  blueprintDao.getByProjectId({project_id: req.params.project_id})
  .then(result => {
    if(Array.isArray(result) && result.length === 0){
      console.log("No blueprint with project Id: "+ req.params.project_id ); 
      return res.status(204).end();
    } else if (Array.isArray(result) && result.length === 1) {
        var uniqueResult = result[0];
        console.log("Retrieved blueprint with project Id: "+ uniqueResult.project_id ); 
      return res.status(200).send(uniqueResult);
    } else {
        console.log("Retrieved blueprint with project Id: "+ result.project_id); 
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
 * Soft delete the blueprint with given project Id
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
      return res.status(204).end();;
    }
  })
  .catch(error => {
    console.error("Error retrieving blueprint:", error);
    return res.status(500).send({ message: "Error retrieving blueprint" });
  });
};

/**
 * Get all project names with given user Id
 * @param {*} req 
 * @param {*} res 
 */
exports.getProjectNames = function (req, res) {
  const userId = req.kauth.grant.access_token.content.sub;
  blueprintDao.getByProjectNamesAndUserId({user_id: userId})
  .then(results => {
    console.log("Retrieved list of project names");
    return res.status(200).json(results);
  })
  .catch(error => {
    console.error("Error retrieving projects:", error);
    return res.status(500).send({ message: "Error retrieving projects" });
  });
}

/**
 * generates services/infrastructure code from blueprint
 * @param {*} req 
 * @param {*} res 
 */
exports.generate = function (req, res) {
    const body = req.body;
    const userId = req.kauth?.grant?.access_token?.content?.sub;
    console.log(
      "Generating project: " + body.projectName + 
      ", for user: " + userId
    );

    const fileName = nanoid(9);
    if(!body.projectId)
    body.projectId = body.projectName + "-" + fileName; // To over ride the frontend value (and to maintain unique folder name)
    const metadata = body.metadata;
    // preprocessing the request json 
    if(body.metadata === undefined){
      delete body.parentId; // dereferencing the parent id from blueprint if save Project check is disabled.
    }
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
        if(body.deployment !== undefined && body.deployment.cloudProvider !== undefined && body.deployment.cloudProvider === "minikube"){
          minikube = "--minikube";
        }

        // Child process to generate the architecture
        console.log("Generating Architecture files...");
        exec(
            `cd ${body.projectId} && jhipster jdl ../${fileName}.jdl --skip-install --skip-git --no-insight --skip-jhipster-dependencies --force ${minikube}`,
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
                // check if application documentation is enabled
                var services = body.services;
                var docsDetails = Object.values(services).find(service => service.applicationFramework === "docusaurus");
                var documentGenerator = !!docsDetails; 
                if(documentGenerator){
                  console.log("Generating Docusaurus files...");
                  generateDocusaurusFiles(fileName, folderPath, deployment, body, res);
                } else {
                  triggerTerraformGenerator(folderPath, deployment, body, res);
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
  exec(`cd ${folderPath} && yo docusaurus --file ../${fileName}-docusaurus.json`, function (
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
      console.log("Generating Infrastructure files...");
      const jsonFileForTerraform = nanoid(9);
      var infraJson = utility.infraJsonGenerator(body);
      // Generate json file for infraJson, if deployment is true
      utility.createJsonFile(jsonFileForTerraform, infraJson);
      //Invoke tf-wdi generator
      generateTerraformFiles(jsonFileForTerraform, folderPath, res);
      console.log(
        "Zipping Architecture/Infrastructure files completed successfully....."
      );
    } else {
      // Generation of Architecture zip, with in the call back function of child process.
      utility.generateZip(folderPath, res);
      console.log("Zipping Architecture files completed successfully.....");
    }
};