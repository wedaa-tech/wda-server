const Flagsmith = require('flagsmith-nodejs');

const flagsmith = new Flagsmith({
    environmentKey: process.env.FLAGSMITH_API_KEY,
});

/**
 * Checks if one or multiple flags are enabled.
 * @param {string|string[]} flags - A single flag or an array of flags to check.
 * @returns {Object|boolean} - If a single flag is passed, returns a boolean indicating if the flag is enabled.
 *                             If an array of flags is passed, returns an object with each flag mapped
 *                             to its corresponding boolean value indicating if it is enabled.
 */
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
    return flagsResult;
}

module.exports = { checkFlagsEnabled };



