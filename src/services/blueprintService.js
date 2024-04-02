const blueprintDao = require('../repositories/blueprintDao');
const utils = require('../utils/core')
/**
 * Update specific blueprint with given project Id
 * @param {*} req
 * @param {*} res
 */
exports.updateBlueprint = function (req, res) {
    const userId = req.kauth.grant.access_token.content.sub;
    const updatedData = { request_json: req.body.request_json, metadata: req.body.metadata };

    blueprintDao
        .update({ project_id: req.params.project_id }, updatedData)
        .then(result => {
            if (result == null) {
                console.log('No Data present with the given Id:' + req.params.project_id);
                return res.status(500).send({ message: 'No Data present with the given Id:' + req.params.project_id });
            } else if (Array.isArray(result) && result.length === 1) {
                var uniqueResult = result[0];
                console.log('Updated blueprint with project Id: ' + uniqueResult.project_id + ', for the user: ' + userId);
                return res.status(200).send(uniqueResult);
            } else {
                console.log('Updated blueprint with project Id: ' + result.project_id + ', for the user: ' + userId);
                return res.status(200).send({ result });
            }
        })
        .catch(error => {
            console.error('Error updating blueprint:', error);
            return res.status(500).send({ message: 'Error updating blueprint' });
        });
};

/**
 * Create or Save blueprint in the Database
 * @param {*} req
 * @param {*} res
 */
exports.saveAsDraft = function (req, res) {
    const body = req.body;
    const userId = req.kauth?.grant?.access_token?.content?.sub;
    console.log('Saving project: ' + body.projectName + ', for user: ' + userId);
    if (!body.projectId) {
        body.projectId = utils.generateProjectId(body.projectName);
    }
    var blueprint = {
        project_id: body.projectId,
        request_json: {
            projectId: body.projectId,
            projectName: body.projectName,
            services: body.services,
            communications: body.communications,
            parentId: body.parentId,
            validationStatus: body.validationStatus,
            imageUrl: body.imageUrl,
        },
        metadata: body.metadata,
        user_id: req.kauth?.grant?.access_token?.content?.sub,
        parentId: req.body?.parentId,
        imageUrl: req.body?.imageUrl,
        description: req.body?.description,
        validationStatus: req.body?.validationStatus,
    };
    blueprintDao
        .createOrUpdate({ project_id: blueprint.project_id }, blueprint)
        .then(savedBlueprint => {
            console.log('Blueprint saved successfully!');
            return res.status(200).json({ projectId: blueprint.project_id, _id: savedBlueprint._id });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).send({ message: 'Error saving blueprint' });
        });
};

/**
 * Verify whether specific blueprint with given project Id belongs to the current user
 * @param {*} req
 * @param {*} res
 */
exports.verifyProject = function (req, res) {
    const userId = req.kauth.grant.access_token.content.sub;
    blueprintDao
        .getByProjectId({ project_id: req.params.project_id })
        .then(result => {
            if (Array.isArray(result) && result.length === 1) {
                var uniqueResult = result[0];
                if (userId == uniqueResult.user_id) {
                    return res.sendStatus(200);
                } else {
                    return res.sendStatus(204);
                }
            } else {
                console.log('Retrieved blueprint with project Id: ' + result.project_id);
                if ((userId = result.user_id)) {
                    return res.status(200).send();
                } else {
                    return res.status(204).send();
                }
            }
        })
        .catch(error => {
            console.error('Error retrieving blueprint:', error);
            return res.status(500).send({ message: 'Error retrieving blueprint' });
        });
};

/**
 * Get specific blueprint with given project Id
 * @param {*} req
 * @param {*} res
 */
exports.getBlueprint = function (req, res) {
    blueprintDao
        .getByProjectId({ project_id: req.params.project_id })
        .then(result => {
            if (Array.isArray(result) && result.length === 0) {
                console.log('No blueprint with project Id: ' + req.params.project_id);
                return res.status(204).end();
            } else if (Array.isArray(result) && result.length === 1) {
                var uniqueResult = result[0];
                console.log('Retrieved blueprint with project Id: ' + uniqueResult.project_id);
                return res.status(200).send(uniqueResult);
            } else {
                console.log('Retrieved blueprint with project Id: ' + result.project_id);
                return res.status(200).send({ result });
            }
        })
        .catch(error => {
            console.error('Error retrieving blueprint:', error);
            return res.status(500).send({ message: 'Error retrieving blueprint' });
        });
};

/**
 * Get all blueprints with given user Id
 * @param {*} req
 * @param {*} res
 */
exports.getBlueprints = function (req, res) {
    const userId = req.kauth.grant.access_token.content.sub;
    blueprintDao
        .getByUserId({ user_id: userId })
        .then(results => {
            console.log('Retrieved blueprints of user:', userId);
            return res.status(200).json({ data: results });
        })
        .catch(error => {
            console.error('Error retrieving blueprints:', error);
            return res.status(500).send({ message: 'Error retrieving blueprints' });
        });
};

/**
 * Soft delete the blueprint with given project Id
 * @param {*} req
 * @param {*} res
 */
exports.deleteBlueprint = function (req, res) {
    blueprintDao
        .getByProjectId({ project_id: req.params.project_id })
        .then(result => {
            if (Array.isArray(result) && result.length === 1) {
                blueprintDao
                    .deleteByProjectId({ project_id: req.params.project_id })
                    .then(result => {
                        return res.status(200).send({ message: 'Blueprint deleted successfully' });
                    })
                    .catch(error => {
                        console.error('Error while deleting blueprint:', error);
                        return res.status(500).send({ message: 'Error while deleting blueprint' });
                    });
            } else {
                console.log('No blueprint is present with project Id: ' + req.params.project_id);
                return res.status(204).end();
            }
        })
        .catch(error => {
            console.error('Error retrieving blueprint:', error);
            return res.status(500).send({ message: 'Error retrieving blueprint' });
        });
};

/**
 * Get all project names with given user Id
 * @param {*} req
 * @param {*} res
 */
exports.getProjectNames = function (req, res) {
    const userId = req.kauth.grant.access_token.content.sub;
    blueprintDao
        .getByProjectNamesAndUserId({ user_id: userId })
        .then(results => {
            console.log('Retrieved list of project names');
            return res.status(200).json(results);
        })
        .catch(error => {
            console.error('Error retrieving projects:', error);
            return res.status(500).send({ message: 'Error retrieving projects' });
        });
};
