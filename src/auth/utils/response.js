/**
 * @typedef {Object} ResponseSuccess
 * @property {boolean} success - Always true for success responses
 * @property {*} [data] - Optional data payload
 * @property {string} [message] - Optional success message
 */

/**
 * @typedef {Object} ResponseFailure
 * @property {boolean} success - Always false for failure responses
 * @property {string} message - Error message
 */

/**
 * @typedef {ResponseSuccess|ResponseFailure} ApiResponse
 */

/**
 * Creates a success response object
 * @param {string} [message] - Optional success message
 * @param {*} [data] - Optional data payload
 * @returns {ResponseSuccess}
 */
function responseSuccess(message, data) {
    return {
        success: true,
        message,
        data
    };
}

/**
 * Creates a failure response object
 * @param {string} message - Error message
 * @returns {ResponseFailure}
 */
function responseFailure(message) {
    return {
        success: false,
        message
    };
}

module.exports = {
    responseSuccess,
    responseFailure
};
