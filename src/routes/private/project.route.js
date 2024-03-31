var projectService = require('../../services/projectService');

module.exports = function (router) {
    router.post('/projects', projectService.saveProject);
    router.get('/projects', projectService.getProjects);
    router.get('/projects/:id', projectService.getProject);
    router.put('/projects/:id', projectService.updateProject);
    router.delete('/projects/:id', projectService.delete);
    router.get('/projects/architectures/:parentId', projectService.getArchitectures);
};
