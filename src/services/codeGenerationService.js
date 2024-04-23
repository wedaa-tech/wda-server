const { request } = require('express');
const codeGenerationDao = require('../repositories/codeGenerationDao');

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
        // Extract relevant data from the codeGeneration object
        const { blueprintId, blueprintVersion } = codeGeneration;
        console.log(codeGeneration);
        // Query the database to find the latest code generation record for the given blueprintId, version
        const latestCodeGeneration = await codeGenerationDao.get({ blueprintId, blueprintVersion }).sort({ createdAt: -1 }).limit(1);
        // If no record found, return false
        if (!latestCodeGeneration || latestCodeGeneration.length === 0) {
            return false;
        }
        // Check if the latest code generation record has status 'COMPLETED'
        const latestStatus = latestCodeGeneration[0].status;
        if (latestStatus === 'COMPLETED') {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error checking code generation:', error);
        return false;
    }
}
