const { sessions } = require('../sessions')
const { sendErrorResponse } = require('../utils')

/**
 * Get message by its ID from a given chat using the provided client.
 * @async
 * @function
 * @param {object} client - The chat client.
 * @param {string} messageId - The ID of the message to get.
 * @param {string} chatId - The ID of the chat to search in.
 * @returns {Promise<object>} - A Promise that resolves with the message object that matches the provided ID, or undefined if no such message exists.
 * @throws {Error} - Throws an error if the provided client, message ID or chat ID is invalid.
 */
const _getMessageById = async (client, messageId, chatId) => {
  const chat = await client.getChatById(chatId)
  const messages = await chat.fetchMessages({ limit: 100 })
  const message = messages.find((message) => { return message.id.id === messageId })
  return message
}

/**
 * Gets information about a message's class.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The session ID.
 * @param {string} req.body.messageId - The message ID.
 * @param {string} req.body.chatId - The chat ID.
 * @returns {Promise<void>} - A Promise that resolves with no value when the function completes.
 */
const getClassInfo = async (req, res) => {
  try {
    const { messageId, chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    res.json({ success: true, message })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Deletes a message.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The session ID.
 * @param {string} req.body.messageId - The message ID.
 * @param {string} req.body.chatId - The chat ID.
 * @param {boolean} req.body.everyone - Whether to delete the message for everyone or just the sender.
 * @returns {Promise<void>} - A Promise that resolves with no value when the function completes.
 */
const deleteMessage = async (req, res) => {
  try {
    const { messageId, chatId, everyone } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const result = await message.delete(everyone)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Downloads media from a message.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The session ID.
 * @param {string} req.body.messageId - The message ID.
 * @param {string} req.body.chatId - The chat ID.
 * @param {boolean} req.body.everyone - Whether to download the media for everyone or just the sender.
 * @returns {Promise<void>} - A Promise that resolves with no value when the function completes.
 */
const downloadMedia = async (req, res) => {
  try {
    const { messageId, chatId, everyone } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const messageMedia = await message.downloadMedia(everyone)
    res.json({ success: true, messageMedia })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}


/**
 * Gets information about a message.
 * @async
 * @function getInfo
 * @param {Object} req - The request object received by the server.
 * @param {Object} req.body - The body of the request object.
 * @param {string} req.body.messageId - The ID of the message to get information about.
 * @param {string} req.body.chatId - The ID of the chat that contains the message to get information about.
 * @param {string} req.params.sessionId - The ID of the session to use the Telegram API with.
 * @param {Object} res - The response object to be sent back to the client.
 * @returns {Object} - The response object with a JSON body containing the information about the message.
 * @throws Will throw an error if the message is not found or if there is an error during the get info operation.
 */
const getInfo = async (req, res) => {
  try {
    const { messageId, chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const info = await message.getInfo()
    res.json({ success: true, info })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}




/**
 * Reply to a specific message in a chat
 *
 * @async
 * @function reply
 * @param {Object} req - The HTTP request object containing the request parameters and body.
 * @param {Object} res - The HTTP response object to send the result.
 * @param {string} req.params.sessionId - The ID of the session to use.
 * @param {string} req.body.messageId - The ID of the message to reply to.
 * @param {string} req.body.chatId - The ID of the chat the message is in.
 * @param {string} req.body.content - The content of the message to send.
 * @param {string} req.body.destinationChatId - The ID of the chat to send the reply to.
 * @param {Object} req.body.options - Additional options for sending the message.
 * @returns {Object} The HTTP response containing the result of the operation.
 * @throws {Error} If there was an error during the operation.
 */
const reply = async (req, res) => {
  try {
    const { messageId, chatId, content, destinationChatId, options } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const repliedMessage = await message.reply(content, destinationChatId, options)
    res.json({ success: true, repliedMessage })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}



module.exports = {
  getClassInfo,
  deleteMessage,
  downloadMedia,
  getInfo,
  reply,
}
