const projectDao = require('../repositories/projectDao');
const blueprintDao = require('../repositories/blueprintDao');
const { getPresignedUrl } = require('../utils/aws-s3/s3Client');

/**
 * save project to the db
 * @param {*} req
 * @param {*} res
 */
exports.saveProject = function (req, res) {
    const userId = req.kauth.grant.access_token.content.sub;
    const project = req.body;
    project.user_id = userId;
    projectDao
        .create(project)
        .then(savedProject => {
            console.log('Project was added successfully!');
            return res
                .status(200)
                .send({ message: 'Project was added successfully!', data: { name: savedProject.name, id: savedProject._id } });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).send({ message: 'Error creating project' });
        });
};

/**
 * Get all projects
 * @param {*} req
 * @param {*} res
 */
exports.getProjects = function (req, res) {
    const userId = req.kauth.grant.access_token.content.sub;
    projectDao
        .get({ user_id: userId })
        .then(result => {
            if (Array.isArray(result)) {
                console.log('Retrieved projects');
                return res.status(200).send({ data: result });
            }
        })
        .catch(error => {
            console.error('Error retrieving projects:', error);
            return res.status(500).send({ message: 'Error retrieving projects' });
        });
};

/**
 * Get specific project with given project Id
 * @param {*} req
 * @param {*} res
 */
exports.getProject = function (req, res) {
    const userId = req.kauth.grant.access_token.content.sub;
    projectDao
        .getByProjectId({ _id: req.params.id, user_id: userId })
        .then(data => {
            if (Array.isArray(data) && data.length === 1) {
                var uniqueResult = data[0];
                console.log('Retrieved project with Id: ' + uniqueResult.id);
                return res.status(200).send(uniqueResult);
            } else {
                console.log('No project available with the given Id!');
                return res.status(204).end();
            }
        })
        .catch(error => {
            console.error('Error retrieving project:', error);
            return res.status(500).send({ message: 'Error retrieving project' });
        });
};

// Commenting out the old getArchitectures !!!
// TODO: Remove after testing 

// /**
//  * Get all architectures with given project Id
//  * @param {*} req
//  * @param {*} res
//  */
// exports.getArchitectures = function (req, res) {
//     const userId = req.kauth.grant.access_token.content.sub;
//     const parentId = req.params?.parentId;
//     blueprintDao
//         .getByUserId({ user_id: userId, parentId: parentId })
//         .then(results => {
//             console.log('Retrieved architectures of user:', userId);
//             return res.status(200).json({ data: results });
//         })
//         .catch(error => {
//             console.error('Error retrieving architectures:', error);
//             return res.status(500).send({ message: 'Error retrieving blueprints' });
//         });
// };



/**
 * Get all architectures with given project Id
 * @param {*} req
 * @param {*} res
 */
exports.getArchitectures = async function (req, res) {
  const userId = req.kauth.grant.access_token.content.sub;
  const parentId = req.params?.parentId;

  try {
    console.log('Retrieved architectures of user:', userId);
    const results = await blueprintDao.getByUserId({ user_id: userId, parentId: parentId });
    console.log(':::Generating preSignedUrl for retrieved architectures of user:::');
    const resultWithPresignedUrls = await Promise.all(
      results.map(async (blueprint) => {
        if (blueprint.imageKey) { 
          try {
            const presignedUrl = await getPresignedUrl(blueprint.imageKey);
            return {
              ...blueprint,
              imagePresignedUrl: presignedUrl,
            };
          } catch (err) {
            console.warn(`[S3] Failed to get URL for ${blueprint.imageKey}: ${err.message}`);
            return blueprint;
          }
        } 
        return blueprint;
      })
    );

    return res.status(200).json({ data: resultWithPresignedUrls });
  } catch (error) {
    console.error('Error retrieving architectures:', error);
    return res.status(500).send({ message: 'Error retrieving blueprints' });
  }
};

/**
 * Update specific project with given project Id
 * @param {*} req
 * @param {*} res
 */
exports.updateProject = function (req, res) {
    const userId = req.kauth.grant.access_token.content.sub;
    const updatedData = { name: req.body.name };

    projectDao
        .update({ _id: req.params.id }, updatedData)
        .then(result => {
            if (result == null) {
                console.log('No project available with the given Id!');
                return res.status(500).send({ message: 'Project available with the given Id!' });
            } else {
                console.log('Updated project with Id: ' + result.id + ', for the user: ' + userId);
                return res.status(200).send({ id: result._id, name: result.name });
            }
        })
        .catch(error => {
            console.error('Error updating project:', error);
            return res.status(500).send({ message: 'Error updating project' });
        });
};

/**
 * Delete the Specific project and its architectures with given Id
 * @param {*} req
 * @param {*} res
 */
exports.delete = function (req, res) {
    const userId = req.kauth.grant.access_token.content.sub;
    projectDao
        .getByProjectId({ _id: req.params.id, user_id: userId })
        .then(result => {
            if (Array.isArray(result) && result.length === 1) {
                projectDao
                    .deleteById({ _id: req.params.id })
                    .then(result => {
                        console.error('Project deleted successfully');
                        return res.status(200).send({ message: 'Project deleted successfully' });
                    })
                    .catch(error => {
                        console.error('Error while deleting Project:', error);
                        return res.status(500).send({ message: 'Error while deleting Project' });
                    });
            } else {
                console.log('No Project is present with Id: ' + req.params.id);
                return res.status(204).end();
            }
        })
        .catch(error => {
            console.error('Error retrieving Project:', error);
            return res.status(500).send({ message: 'Error retrieving Project' });
        });
};
