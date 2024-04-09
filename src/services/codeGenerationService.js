const codeGenerationDao = require('../repositories/codeGenerationDao');

exports.saveCodeGeneration = function (codeGeneration) {
    return codeGenerationDao.createOrUpdate(codeGeneration)
    .then(savedcodeGeneration => {
            console.log('code generation saved successfully!');
        return savedcodeGeneration._id;
    })
}

exports.updateCodeGeneration = function (codeGenerationId, codeGeneration) {
    return codeGenerationDao.createOrUpdate({_id:codeGenerationId}, codeGeneration)
    .then(updatedcodeGeneration => {
            console.log('code generation updated successfully!');
        return updatedcodeGeneration._id;
    })
}

exports.getCodeGenerationStatus = async function (req, res) {
    try {
        const userId = req.kauth.grant.access_token.content.sub;
        const blueprintIds = req.body;
        const statusList = await codeGenerationDao.getStatusForBlueprints(blueprintIds);
        res.json(statusList);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};