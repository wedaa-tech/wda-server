const feedbackDao = require('../repositories/feedbackDao');

/**
 * save feedback to the db
 * @param {*} req
 * @param {*} res
 */
exports.saveFeedback = function (req, res) {
    const userId = req?.kauth?.grant?.access_token?.content?.sub;
    const feedback = req.body;
    feedback.user_id = userId;
    feedbackDao
        .create(feedback)
        .then(savedFeedback => {
            console.log('Feedback was added successfully!');
            return res.status(200).send({ message: 'Feedback was added successfully!', user: userId });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).send({ message: 'Error creating feedback' });
        });
};

/**
 * Get all feedbacks [user with ADMIN role]
 * @param {*} req
 * @param {*} res
 */
exports.getFeedbacks = function (req, res) {
    const roles = req?.kauth?.grant?.access_token?.content?.realm_access?.roles;
    // Check if the "ADMIN" role is present in the roles array
    if (roles && roles.includes('ADMIN')) {
        feedbackDao
            .get()
            .then(result => {
                if (Array.isArray(result)) {
                    console.log('Retrieved all feedbacks');
                    return res.status(200).send({ data: result });
                }
            })
            .catch(error => {
                console.error('Error retrieving feedbacks:', error);
                return res.status(500).send({ message: 'Error retrieving feedbacks' });
            });
    } else {
        // If "ADMIN" role is not present, send a message indicating unauthorized access
        return res.status(403).send({ message: 'User is not authorized!' });
    }
};
