const Flagsmith = require('flagsmith-nodejs');

const flagsmith = new Flagsmith({
    environmentKey: process.env.FLAGSMITH_API_KEY,
});

async function checkFlagsEnabled(flags) {
    const allFlags = await flagsmith.getEnvironmentFlags();
    const flagsResult = {};

    if (Array.isArray(flags)) {
        for (const flag of flags) {
            flagsResult[flag] = allFlags.isFeatureEnabled(flag);
        }
    } else if (typeof flags === 'string') {
        return allFlags.isFeatureEnabled(flags);
    }
    console.log(flagsResult);
    return flagsResult;
}

module.exports = { checkFlagsEnabled };



