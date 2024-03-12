const requirementDao = require('../dao/requirementDao');

/**
 * save requirement to the db
 * @param {*} req
 * @param {*} res
 */
exports.saveRequirement = function (req, res) {
    const userId = req?.kauth?.grant?.access_token?.content?.sub;
    const requirement = req.body;
    requirement.user_id = userId;
    
    requirementDao
        .create(requirement)
        .then(savedRequirement => {
            console.log('Requirement was added successfully!', "user: ", userId);
            return res
                .status(200)
                .send(savedRequirement);
        })
        .catch(error => {
            console.error(error);
            return res.status(500).send({ message: 'Error creating requirement' });
        });
};

/**
 * Update specific requirement with given Id
 * @param {*} req
 * @param {*} res
 */
exports.updateRequirement = function (req, res) {
    const userId = req?.kauth?.grant?.access_token?.content?.sub;
    const updatedData = req.body;

    requirementDao
        .update({ _id: req.params.id }, updatedData)
        .then(result => {
            if (result == null) {
                console.log('No requirement available with the given Id!');
                return res.status(500).send({ message: 'No requirement available with the given Id!' });
            } else {
                console.log('Updated requirement with Id: ' + result.id + ', for the user: ' + userId);
                return res.status(200).send(result);
            }
        })
        .catch(error => {
            console.error('Error updating requirement:', error);
            return res.status(500).send({ message: 'Error updating requirement' });
        });
};
