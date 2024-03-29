const refArchitectureDao = require('../dao/refArchitectureDao');
const utility = require('../utility/core');

/**
 * save refArchitecture to the db
 * @param {*} req
 * @param {*} res
 */
exports.saveRefArch = function (req, res) {
    const body = req.body;
    if (!body.projectId) {
        body.projectId = utility.generateProjectId(req.body.projectName);
    }
    var architecture = {
        id: body.projectId,
        name: body.projectName,
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
        type: req.body?.type || 'APPLICATION',
        imageUrl: req.body?.imageUrl,
        description: req.body?.description,
        published: req.body?.published || false,
        validationStatus: req.body.validationStatus,
    };
    refArchitectureDao
        .createOrUpdate({ id: architecture.id }, architecture)
        .then(savedArchitecture => {
            console.log('Architecture saved successfully!');
            return res.status(200).json({ projectId: architecture.id,_id:savedArchitecture._id });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).send({ message: 'Error saving architecture' });
        });
};

/**
 * Get specific architecture with given Id
 * @param {*} req
 * @param {*} res
 */
exports.getRefArchById = function (req, res) {
    const userId = req.kauth.grant.access_token.content.sub;
    refArchitectureDao
        .get({ id: req.params.id })
        .then(result => {
            if (Array.isArray(result) && result.length === 1) {
                var uniqueResult = result[0];
                console.log('Retrieved architecture with architecture Id: ' + uniqueResult.id);
                return res.status(200).send(uniqueResult);
            } else {
                console.log('Retrieved architecture with project Id: ' + result.id);
                return res.status(200).send({ result });
            }
        })
        .catch(error => {
            console.error('Error retrieving architecture:', error);
            return res.status(500).send({ message: 'Error retrieving architecture' });
        });
};

/**
 * Get all ref architectures
 * @param {*} req
 * @param {*} res
 */
exports.get = function (req, res) {
    refArchitectureDao
        .get({})
        .then(result => {
            if (Array.isArray(result)) {
                console.log('Retrieved architectures');
                return res.status(200).send({ data: result });
            }
        })
        .catch(error => {
            console.error('Error retrieving architecture:', error);
            return res.status(500).send({ message: 'Error retrieving architectures' });
        });
};

/**
 * Update specific Architecture with given Id
 * @param {*} req
 * @param {*} res
 */
exports.updateRefArchs = function (req, res) {
    const userId = req.kauth.grant.access_token.content.sub;
    const updatedData = req.body;

    refArchitectureDao
        .update({ id: req.params.id }, updatedData)
        .then(result => {
            if (result == null) {
                console.log('No Data present with the given Id:' + req.params.id);
                return res.status(500).send({ message: 'No Data present with the given Id:' + req.params.id });
            } else if (Array.isArray(result) && result.length === 1) {
                var uniqueResult = result[0];
                console.log('Updated architecture with Id: ' + uniqueResult.id + ', for the user: ' + userId);
                return res.status(200).send(uniqueResult);
            } else {
                console.log('Updated architecture with Id: ' + result.id + ', for the user: ' + userId);
                return res.status(200).send({ result });
            }
        })
        .catch(error => {
            console.error('Error updating architecture:', error);
            return res.status(500).send({ message: 'Error updating architecture' });
        });
};

/**
 * Delete the Specific Architecture with given object Id
 * @param {*} req
 * @param {*} res
 */
exports.delete = function (req, res) {
    refArchitectureDao
        .get({ _id: req.params.id })
        .then(result => {
            if (Array.isArray(result) && result.length === 1) {
                refArchitectureDao
                    .delete({ _id: req.params.id })
                    .then(result => {
                        return res.status(200).send({ message: 'Reference Architecture deleted successfully' });
                    })
                    .catch(error => {
                        console.error('Error while deleting Reference Architecture:', error);
                        return res.status(500).send({ message: 'Error while deleting Reference Architecture' });
                    });
            } else {
                console.log('No Reference Architecture is present with Id: ' + req.params.id);
                return res.status(204);
            }
        })
        .catch(error => {
            console.error('Error retrieving Reference Architecture:', error);
            return res.status(500).send({ message: 'Error retrieving Reference Architecture' });
        });
};

/**
 * Delete the Specific Architecture with given projectId
 * @param {*} req
 * @param {*} res
 */
exports.deleterefArchById = function (req, res) {
    refArchitectureDao
        .get({ id: req.params.id })
        .then(result => {
            if (Array.isArray(result) && result.length === 1) {
                refArchitectureDao
                    .delete({ id: req.params.id })
                    .then(result => {
                        return res.status(200).send({ message: 'Reference Architecture deleted successfully' });
                    })
                    .catch(error => {
                        console.error('Error while deleting Reference Architecture:', error);
                        return res.status(500).send({ message: 'Error while deleting Reference Architecture' });
                    });
            } else {
                console.log('No Reference Architecture is present with Id: ' + req.params.id);
                return res.status(204);
            }
        })
        .catch(error => {
            console.error('Error retrieving Reference Architecture:', error);
            return res.status(500).send({ message: 'Error retrieving Reference Architecture' });
        });
};

/**
 * Toggle the 'published' value of a specific Architecture by name
 * @param {*} req
 * @param {*} res
 */
exports.togglePublishedById = function (req, res) {
    refArchitectureDao
        .get({ id: req.params.id })
        .then(result => {
            if (Array.isArray(result) && result.length === 1) {
                const architecture = result[0];
                const updatedPublishedValue = !architecture.published;

                refArchitectureDao
                    .update({ id: req.params.id }, { published: updatedPublishedValue })
                    .then(updatedResult => {
                        console.log(`Published value for Architecture with Id ${req.params.id} is updated to ${updatedPublishedValue}`);
                        return res.status(200).send({ message: `Published value updated successfully to ${updatedPublishedValue}` });
                    })
                    .catch(error => {
                        console.error('Error updating published value:', error);
                        return res.status(500).send({ message: 'Error updating published value' });
                    });
            } else {
                console.log('No Architecture found with the given name');
                return res.status(404).send({ message: 'No Architecture found with the given name' });
            }
        })
        .catch(error => {
            console.error('Error retrieving Architecture:', error);
            return res.status(500).send({ message: 'Error retrieving Architecture' });
        });
};
