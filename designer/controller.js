const { nanoid } = require("nanoid");
const utility = require('../utility/core');
const jdlConverter = require('../utility/jsonToJdl');
const exec = require("child_process").exec;

exports.test = function (req, res) {
    return res.status(200).send({ message: "Test API for wda server" });
};

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

    // Create a json file for the jhipster generator
    utility.createJsonFile(fileName, body);

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
