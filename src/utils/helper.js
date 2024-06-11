/**
 * Capitalizes the first letter of the given name.
 * 
 * @param {string} name - The name to be capitalized.
 * @returns {string} - The capitalized name.
 */
exports.capitalizeName = (name)=> {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Generates a random string of specified length using uppercase English letters (A-Z).
 * 
 * @param {number} length - The length of the random string to be generated.
 * @returns {string} - A randomly generated string of the specified length.
 */
exports.randomStringGenerator = length => {
    // Use String.fromCharCode and Math.random to generate random characters
    return Array(length)
        .fill(null)
        .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 65))
        .join('');
};

/**
 * Converts a string with underscores to camelCase.
 * 
 * @param {string} str - The string to be converted to camelCase.
 * @returns {string} - The camelCase version of the input string.
 */
exports.toCamelCase = str => {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};