const tipsDao = require('../dao/tipsDao');

/**
 * save tip to the db  [user with ADMIN role]
 * @param {*} req
 * @param {*} res
 */
exports.saveTip = function (req, res) {
    const roles = req?.kauth?.grant?.access_token?.content?.realm_access?.roles;
    // Check if the "ADMIN" role is present in the roles array
    if (roles && roles.includes("ADMIN")) {
        const userId = req?.kauth?.grant?.access_token?.content?.sub;
        const tip = req.body;
        tip.user_id = userId;
        tipsDao
            .create(tip)
            .then(savedTip => {
                console.log('Tip was added successfully!');
                return res
                    .status(200)
                    .send(savedTip);
            })
            .catch(error => {
                console.error(error);
                return res.status(500).send({ message: 'Error creating Tip' });
            });
    } else {
        // If "ADMIN" role is not present, send a message indicating unauthorized access
        return res.status(403).send({ message: 'User is not authorized!' });
    }
};

/**
 * Get all tips
 * @param {*} req
 * @param {*} res
 */
exports.getTips = function (req, res) {
    tipsDao
        .get()
        .then(result => {
            if (Array.isArray(result)) {
                console.log('Retrieved all tips');
                return res.status(200).send( result );
            }
        })
        .catch(error => {
            console.error('Error retrieving tips:', error);
            return res.status(500).send({ message: 'Error retrieving tips' });
        });
    
};