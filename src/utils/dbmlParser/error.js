/**
 * Extracts a detailed error message from a CompilerError object.
 * @param {Object} error - The error object.
 * @returns {string} The detailed error message.
 */
exports.dbmlParseError = error => {
    let errorMessage = 'Error parsing DBML';
    if (error.diags && error.diags.length > 0) {
        const diag = error.diags[0];
        errorMessage = `${diag.message} (found: '${diag.found}' at line: ${diag.location.start.line}, column: ${diag.location.start.column})`;
    }
    return errorMessage;
};
