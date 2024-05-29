const codeGenerationDao = require('../repositories/codeGenerationDao');
const { codeGenerationStatus } = require('../utils/constants');

exports.saveCodeGeneration = function (codeGeneration) {
    return codeGenerationDao.create(codeGeneration).then(savedcodeGeneration => {
        console.log('code generation saved successfully!');
        return savedcodeGeneration._id;
    });
};

exports.updateCodeGeneration = function (codeGenerationId, codeGeneration) {
    return codeGenerationDao.createOrUpdate({ _id: codeGenerationId }, codeGeneration).then(updatedcodeGeneration => {
        console.log('code generation updated successfully!');
        return updatedcodeGeneration._id;
    });
};

exports.getCodeGenerationStatus = async function (req, res) {
    try {
        const userId = req.kauth.grant.access_token.content.sub;
        const requestBody = req.body;
        const blueprintIds = requestBody.blueprintIds;

        const statusList = await codeGenerationDao.getStatusForBlueprints(blueprintIds);
        res.json(statusList);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.checkIfCodeGenerationExists = async function (codeGeneration) {
    try {
        const { blueprintId, blueprintVersion } = codeGeneration;
        const latestCodeGeneration = await codeGenerationDao.getByBlueprintIdAndVersion({ blueprintId, blueprintVersion });
        return latestCodeGeneration && latestCodeGeneration.status === codeGenerationStatus.COMPLETED;
    } catch (error) {
        console.error('Error checking code generation:', error);
        return false;
    }
};
