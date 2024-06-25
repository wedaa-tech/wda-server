const refArchitectureDao = require('../repositories/refArchitectureDao');
const blueprintDao = require('../repositories/blueprintDao');


/**
 * Get all project Names with given user Id
 * @param {*} req
 * @param {*} res
 */
exports.getProjectNames = async function (req, res) {
    try {
        const userId = req.kauth.grant.access_token.content.sub;
        
        let blueprintProjectNames = [];
        try {
            blueprintProjectNames = await blueprintDao.getByProjectNamesAndUserId({ user_id: userId });
        } catch (err) {
            console.error("Error fetching blueprint project names:", err);
            return res.status(500).send({ error: "Failed to fetch blueprint project names" });
        }
        
        let refArchitectureProjectNames = [];
        try {
            refArchitectureProjectNames = await refArchitectureDao.getAllProjectNames();
        } catch (err) {
            console.error("Error fetching reference architecture project names:", err);
            return res.status(500).send({ error: "Failed to fetch reference architecture project names" });
        }
        
        const ProjectNames = [...blueprintProjectNames, ...refArchitectureProjectNames];
        console.log("Fetched Project Names");
        return res.status(200).send({ ProjectNames: ProjectNames });
        
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).send({ error: "An unexpected error occurred" });
    }
};
