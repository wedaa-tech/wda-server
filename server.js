const express = require("express");
const app = express();
const fs = require("fs");
const path = require('path');
const { nanoid } = require("nanoid");
const archiver = require("archiver");
const cors = require("cors");
const exec = require("child_process").exec;
const jdlConverter = require("./jsonToJdl.js");


app.use(express.json()); // Body parser
app.use(cors());

/**
 * Post call for JHipster Yeoman Generator
 */
app.post("/generateJDL", (req, res) => {
  // Fetch the username and project name for wda from request params
  const username = req.query.username;
  const projectName = req.query.projectName;
  const generateInfra = req.query.generateInfra;
  console.log(
    "Hi",
    username,
    "Your project Name is",
    projectName,
    "generate infrastructure is",
    generateInfra
  );

  // filter the request sent from UI

  delete req.body.entity;

  if (req.body.communication[0].clientName === "" && req.body.communication[0].serverName === "") {
    delete req.body.communication;
  }

  const body = req.body;
  const fileName = nanoid(9);
  body.projectName = req.query.projectName + "-" + fileName; // To over rider the frontend values (and to maintain uniq folder name)

  // Generates the Dir for Blueprints 
  generateBlueprint(body.projectName, fileName, res);

  // Validate the Deployment section //
  body.deployment.kubernetesServiceType = "Ingress";  // no need to ask the to user

  if (body.deployment.ingressType.toLowerCase() === "nginx") {
    // As we are not supporting Nginx as of now, change to Istio
    body.deployment.ingressType = "istio";
    body.deployment.istio = "true";
  } else if (body.deployment.ingressType.toLowerCase() === "istio") {
    body.deployment.istio = "true";
  }

  // get the app names 
  const applications = body.application;
  const applicationCount = Object.keys(applications).length;
  const applicationError = new Map();
  const appsFolders = [];

  for (let i = 0; i < applicationCount; i++) {
    // Error handling
    if (applications[i].applicationName === "") {
      if (i in applicationError)
        applicationError.get(i).set("Application Name cannot be set empty");
      else
        applicationError[i] = ["Application Name cannot be set empty"];
    }
    appsFolders.push(applications[i].applicationName);
  }

  // if cloud provider is AWS, update the dockerRepositoryName
  if (generateInfra === "true" && body.wdi.cloudProvider === "aws")
    body.deployment.dockerRepositoryName = `${body.wdi.awsAccountId}.dkr.ecr.${body.wdi.awsRegion}.amazonaws.com`;

  const errorData = new Map();
  if (applicationError.size > 0)
    errorData["applications"] = applicationError;

  // return error response 400: Application Name is Empty
  if (Object.keys(errorData).length >= 1)
    return res.status(400).send(errorData);

  body.deployment.appsFolders = appsFolders;

  // if cloud provider is AWS 
  body.deployment.kubernetesStorageProvisioner = "ebs.csi.aws.com";

  // Create a json file for the jhipster generator
  createJsonFile(fileName, body);

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
      `cd ${body.projectName} && jhipster jdl ../${fileName}.jdl --skip-install --skip-git --no-insight`,
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
        if (generateInfra === "true") {
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
          generateZip(folderPath, res);
          console.log("Zipping Architecture files completed successfully.....");
        }
      }
    );

  }, 5000);

});

/**
 * Post call for Terrafrom Yeoman Generator
 */
app.post("/generate", (req, res) => {
  const body = req.body;
  const fileName = nanoid(9);
  body.projectName = body.projectName + "-" + fileName; // To over ride the frontend values (and to maintain uniqe folder name)
  const folderPath = `./${body.projectName}`;

  // Generates the Dir for Blueprints 
  generateBlueprint(body.projectName, fileName, res);

  // Create a json file for the generator
  createJsonFile(fileName, body);

  // Child process uses the above generated json file to write the terrafrom files.
  generateTerrafromFiles(fileName, folderPath, res);

});

/**
 * Health check api for the wdi/wda server
 */
app.get("/health", (req, res) => {
  return res.status(200).send({ message: "The wdi/wda sever is health" });
});

/**
 * Child process to generate the Infrastructure files
 *
 * @param {*} fileName : random string with 9 characters
 * @param {*} folderPath : combination of the projectName +fileName
 * @param {*} res  : response to be sent to the user
 */
const generateTerrafromFiles = (fileName, folderPath, res) => {
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
    generateZip(folderPath, res);
  });
};

/**
 * The method will generate json file for the Terraform generator
 *
 * @param {*} fileName : name of the file to generate
 * @param {*} body : body of json file to generate
 */
const createJsonFile = (fileName, body) => {
  fs.writeFile(
    `${fileName}.json`,
    JSON.stringify(body, null, 4),
    "utf8",
    function(err, result){ 
      fs.writeFile(
        `${body.projectName}/blueprints/${fileName}.json`,
        JSON.stringify(body, null, 4),
        "utf8",
        err => {
          if (err) throw err;
        }
      );
  });
};

/**
 * The method will generate the zip of the any folder and attach it to the response
 *
 * @param {*} folderPath : Folder Path
 * @param {*} res : Response header
 */
const generateZip = (folderPath, res) => {
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.on("error", function (err) {
    res.status(500).send({ error: err.message });
  });

  // Set the content type of the response to a zip file.
  res.attachment("archive.zip");

  // Pipe the archive to the response stream.
  archive.pipe(res);

  // Add the folder to the archive.
  archive.directory(folderPath, false);

  // archive.finalize();

  // Finalize the archive and delete the dump folders/files.
  archive.finalize().then(() => {
    // Remove the folder once the archive is complete.
    fs.rm(folderPath , { recursive: true }, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(folderPath,'Directory removed');
      }
    });

    // Remove all .json and .jdl files except [ "package.json", "package-lock.json" ,"wdi-wda-example.json", "reminder.jdl" ]
    const excludedFiles = [
      "package.json",
      "package-lock.json",
      "wdi-wda-example.json",
      "reminder.jdl"
    ];
    fs.readdir(`${process.cwd()}`, (err, files) => {
      if (err) {
        console.error(err);
      } else {
        files.forEach((file) => {
          if (file.endsWith(".json") || file.endsWith(".jdl")) {
            if (!excludedFiles.includes(file)) {
              fs.unlink(`${process.cwd()}/${file}`, (err) => {
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
    })
  }).catch((err) => {
    console.error(err);
    res.status(500).send({ error: err.message });
  });

};

const generateBlueprint = (folderPath, fileName, res) => {
  const destDir = folderPath;
  fs.mkdir(destDir, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error creating destination folder');
      return;
    }
  });
  const destDirForBlueprints = path.join(folderPath, `blueprints`);
  fs.mkdir(destDirForBlueprints, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error creating destination folder');
      return;
    }
  });
}

app.listen(3001, () => {
  console.log("⚡: Server listening on port 3001");
});
