const { sessions } = require('../sessions')
const { sendErrorResponse } = require('../utils')

/**
 * @function
 * @async
 * @name getClassInfo
 * @description Gets information about a chat using the chatId and sessionId
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} req.body.chatId - The ID of the chat to get information for
 * @param {string} req.params.sessionId - The ID of the session to use
 * @returns {Object} - Returns a JSON object with the success status and chat information
 * @throws {Error} - Throws an error if chat is not found or if there is a server error
 */
const getClassInfo = async (req, res) => {
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat) { sendErrorResponse(res, 404, 'Chat not Found') }
    res.json({ success: true, chat })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Clears all messages in a chat.
 *
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The ID of the session.
 * @param {string} req.body.chatId - The ID of the chat to clear messages from.
 * @throws {Error} If the chat is not found or there is an internal server error.
 * @returns {Object} The success status and the cleared messages.
 */
const clearMessages = async (req, res) => {
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat) { sendErrorResponse(res, 404, 'Chat not Found') }
    const clearMessages = await chat.clearMessages()
    res.json({ success: true, clearMessages })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}


/**
 * Delete a chat.
 *
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The session ID.
 * @param {string} req.body.chatId - The ID of the chat to be deleted.
 * @returns {Object} A JSON response indicating whether the chat was deleted successfully.
 * @throws {Object} If there is an error while deleting the chat, an error response is sent with a status code of 500.
 * @throws {Object} If the chat is not found, an error response is sent with a status code of 404.
 */
const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat) { sendErrorResponse(res, 404, 'Chat not Found') }
    const deleteChat = await chat.delete()
    res.json({ success: true, deleteChat })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Fetches messages from a specified chat.
 *
 * @function
 * @async
 *
 * @param {Object} req - The request object containing sessionId, chatId, and searchOptions.
 * @param {string} req.params.sessionId - The ID of the session associated with the chat.
 * @param {Object} req.body - The body of the request containing chatId and searchOptions.
 * @param {string} req.body.chatId - The ID of the chat from which to fetch messages.
 * @param {Object} req.body.searchOptions - The search options to use when fetching messages.
 *
 * @param {Object} res - The response object to send the fetched messages.
 * @returns {Promise<Object>} A JSON object containing the success status and fetched messages.
 *
 * @throws {Error} If the chat is not found or there is an error fetching messages.
 */
const fetchMessages = async (req, res) => {
  try {
    /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'Unique whatsApp identifier for the given Chat (either group or personnal)',
            example: '6281288888888@c.us'
          },
          searchOptions: {
            type: 'object',
            description: 'Search options for fetching messages',
            example: '{}'
          }
        }
      }
    }
  */
    const { chatId, searchOptions } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat) { sendErrorResponse(res, 404, 'Chat not Found') }
    const messages = await chat.fetchMessages(searchOptions)
    res.json({ success: true, messages })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Gets the contact for a chat
 * @async
 * @function
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @param {string} req.params.sessionId - The ID of the current session
 * @param {string} req.body.chatId - The ID of the chat to get the contact for
 * @returns {Promise<void>} - Promise that resolves with the chat's contact information
 * @throws {Error} - Throws an error if chat is not found or if there is an error getting the contact information
 */
const getContact = async (req, res) => {
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat) { sendErrorResponse(res, 404, 'Chat not Found') }
    const contact = await chat.getContact()
    res.json({ success: true, contact })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}



module.exports = {
  getClassInfo,
  clearMessages,
  deleteChat,
  fetchMessages,
  getContact,
}
