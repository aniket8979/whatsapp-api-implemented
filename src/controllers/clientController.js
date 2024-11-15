const { MessageMedia, Location, Buttons, List, Poll } = require('whatsapp-web.js')
const { sessions } = require('../sessions')
const { sendErrorResponse } = require('../utils')


/**
 * Send bulk messages to multiple chat IDs
 * 
 * @async
 * @function sendBulkMessages
 * @param {Object} client - The WhatsApp client instance
 * @param {Array} messages - Array of message objects to be sent
 * @param {number} delay - Delay between messages in milliseconds (optional, default: 1000)
 * @returns {Array} - Array of sent message objects
 */
async function sendBulkMessages(client, messages) { //delay = 1000
  const sentMessages = [];

  for (const message of messages) {
    let { chatId, content, options } = message;
    try {
      const messageOut = await client.sendMessage(chatId, content, options);
      sentMessages.push(messageOut);
      console.log(`Message sent successfully to ${chatId}`);
    } catch (error) {
      console.error(`Failed to send message to ${chatId}:`, error.message);
    }
    // Add delay between messages to avoid rate limiting
    // await new Promise(resolve => setTimeout(resolve, delay));
  }
  return sentMessages;
}



const sendAllMessage = async (req, res) => { 
  const client = sessions.get(req.params.sessionId);
  // const messagesToSend = [
  //   { chatId: '1234567890@c.us', content: 'Hello, user 1!', options: {} },
  //   { chatId: '0987654321@c.us', content: 'Hello, user 2!', options: {} },
  //   { chatId: '1122334455@c.us', content: 'Hello, user 3!', options: {} }
  // ];
  const messagesToSend = req.body.messages;
  try {
    const sentMessages = await sendBulkMessages(client, messagesToSend);
    console.log(`Successfully sent ${sentMessages.length} messages`);
    res.json({ success: true, sentMessages });
  } catch (error) {
    console.error('Error sending bulk messages:', error);
    sendErrorResponse(res, 500, 'Error sending bulk messages');
  }
}






/**
 * Send a message to a chat using the WhatsApp API
 *
 * @async
 * @function sendMessage
 * @param {Object} req - The request object containing the request parameters
 * @param {Object} req.body - The request body containing the chatId, content, contentType and options
 * @param {string} req.body.chatId - The chat id where the message will be sent
 * @param {string|Object} req.body.content - The message content to be sent, can be a string or an object containing the MessageMedia data
 * @param {string} req.body.contentType - The type of the message content, must be one of the following: 'string', 'MessageMedia', 'MessageMediaFromURL', 'Location', 'Buttons', or 'List'
 * @param {Object} req.body.options - Additional options to be passed to the WhatsApp API
 * @param {string} req.params.sessionId - The id of the WhatsApp session to be used
 * @param {Object} res - The response object
 * @returns {Object} - The response object containing a success flag and the sent message data
 * @throws {Error} - If there is an error while sending the message
 */
const sendMessage = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      '@content': {
        "application/json": {
          schema: {
            type: 'object',
            properties: {
              chatId: {
                type: 'string',
                description: 'The Chat id which contains the message (Group or Individual)',
              },
              contentType: {
                type: 'string',
                description: 'The type of message content, must be one of the following: string, MessageMedia, MessageMediaFromURL, Location, Buttons, or List',
              },
              content: {
                type: 'object',
                description: 'The content of the message, can be a string or an object',
              },
              options: {
                type: 'object',
                description: 'The message send options',
              }
            }
          },
          examples: {
            string: { value: { chatId: '6281288888888@c.us', contentType: 'string', content: 'Hello World!' } },
            MessageMedia: { value: { chatId: '6281288888888@c.us', contentType: 'MessageMedia', content: { mimetype: 'image/jpeg', data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', filename: 'image.jpg' } } },
            MessageMediaFromURL: { value: { chatId: '6281288888888@c.us', contentType: 'MessageMediaFromURL', content: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example' } },
            Location: { value: { chatId: '6281288888888@c.us', contentType: 'Location', content: { latitude: -6.2, longitude: 106.8, description: 'Jakarta' } } },
            Buttons: { value: { chatId: '6281288888888@c.us', contentType: 'Buttons', content: { body: 'Hello World!', buttons: [{ body: 'button 1' }], title: 'Hello World!', footer: 'Hello World!' } } },
            List: {
              value: { chatId: '6281288888888@c.us', contentType: 'List', content: { body: 'Hello World!', buttonText: 'Hello World!', sections: [{ title: 'sectionTitle', rows: [{ id: 'customId', title: 'ListItem2', description: 'desc' }, { title: 'ListItem2' }] }], title: 'Hello World!', footer: 'Hello World!' } }
            },
            Contact: {
              value: { chatId: '6281288888888@c.us', contentType: 'Contact', content: { contactId: '6281288888889@c.us' } }
            },
            Poll: {
              value: { chatId: '6281288888888@c.us', contentType: 'Poll', content: { pollName: 'Cats or Dogs?', pollOptions: ['Cats', 'Dogs'], options: { allowMultipleAnswers: true } } }
            },
          }
        }
      }
    }
  */

  try {
    const { chatId, content, contentType, options } = req.body
    const client = sessions.get(req.params.sessionId)

    let messageOut
    switch (contentType) {
      case 'string':
        if (options?.media) {
          const media = options.media
          media.filename = null
          media.filesize = null
          options.media = new MessageMedia(media.mimetype, media.data, media.filename, media.filesize)
        }
        messageOut = await client.sendMessage(chatId, content, options)
        break
      case 'Contact': {
        const contactId = content.contactId.endsWith('@c.us') ? content.contactId : `${content.contactId}@c.us`
        const contact = await client.getContactById(contactId)
        messageOut = await client.sendMessage(chatId, contact, options)
        break
      }
      default:
        return sendErrorResponse(res, 404, 'contentType invalid, must be string, MessageMedia, MessageMediaFromURL, Location, Buttons, List, Contact or Poll')
    }

    res.json({ success: true, message: messageOut })
  } catch (error) {
    console.log(error)
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Get session information for a given sessionId
 *
 * @async
 * @function getClientInfo
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.sessionId - The sessionId for which the session info is requested
 * @returns {Object} - Response object with session info
 * @throws Will throw an error if session info cannot be retrieved
 */
const getClassInfo = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const sessionInfo = await client.info
    res.json({ success: true, sessionInfo })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Check if a user is registered on WhatsApp
 *
 * @async
 * @function isRegisteredUser
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.sessionId - The sessionId in which the user is registered
 * @param {string} req.body.id - The id of the user to check
 * @returns {Object} - Response object with a boolean indicating whether the user is registered
 * @throws Will throw an error if user registration cannot be checked
 */
const isRegisteredUser = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          number: {
            type: 'string',
            description: 'The number or ID (\"@c.us\" will be automatically appended if not specified)',
            example: '6281288888888'
          },
        }
      },
    }
  */
  try {
    const { number } = req.body
    const client = sessions.get(req.params.sessionId)
    const result = await client.isRegisteredUser(number)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves the registered WhatsApp ID for a number
 *
 * @async
 * @function getNumberId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.sessionId - The sessionId in which the user is registered
 * @param {string} req.body.id - The id of the user to check
 * @returns {Object} - Response object with a boolean indicating whether the user is registered
 * @throws Will throw an error if user registration cannot be checked
 */
const getNumberId = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          number: {
            type: 'string',
            description: 'The number or ID (\"@c.us\" will be automatically appended if not specified)',
            example: '6281288888888'
          },
        }
      },
    }
  */
  try {
    const { number } = req.body
    const client = sessions.get(req.params.sessionId)
    const result = await client.getNumberId(number)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Create a group with the given name and participants
 *
 * @async
 * @function createGroup
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.sessionId - The sessionId in which to create the group
 * @param {string} req.body.name - The name of the group to create
 * @param {Array} req.body.participants - Array of user ids to add to the group
 * @returns {Object} - Response object with information about the created group
 * @throws Will throw an error if group cannot be created
 */
const createGroup = async (req, res) => {
  try {
    const { name, participants } = req.body
    const client = sessions.get(req.params.sessionId)
    const response = await client.createGroup(name, participants)
    res.json({ success: true, response })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Set the status of the user in a given session
 *
 * @async
 * @function setStatus
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.sessionId - The sessionId in which to set the status
 * @param {string} req.body.status - The status to set
 * @returns {Object} - Response object indicating success
 * @throws Will throw an error if status cannot be set
 */
const setStatus = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'New status message',
            example: 'I\'m running WhatsApp Web Api'
          },
        }
      },
    }
  */
  try {
    const { status } = req.body
    const client = sessions.get(req.params.sessionId)
    await client.setStatus(status)
    res.json({ success: true })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves the contacts of the current session.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The session ID associated with the client.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves with the retrieved contacts or rejects with an error.
 */
const getContacts = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const contacts = await client.getContacts()
    res.json({ success: true, contacts })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieve all chats for the given session ID.
 *
 * @function
 * @async
 *
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The session ID.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>} A Promise that resolves when the operation is complete.
 *
 * @throws {Error} If the operation fails, an error is thrown.
 */
const getChats = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const chats = await client.getChats()
    res.json({ success: true, chats })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}







/**
 * Get the chat with the given ID.
 *
 * @async
 * @function getChatById
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The session ID to use for the client.
 * @param {string} req.body.chatId - The ID of the chat to get.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} - A promise that resolves to an object with a success property and the chat object.
 * @throws {Error} - Throws an error if the operation fails.
 */
const getChatById = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    res.json({ success: true, chat })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}





/**
 * Retrieves the contact with the specified ID.
 * @async
 * @function getContactById
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The session ID of the client.
 * @param {string} req.body.contactId - The ID of the contact to retrieve.
 * @param {Object} res - The response object.
 * @returns {Object} - An object containing a success flag and the retrieved contact.
 * @throws {Error} - If an error occurs while retrieving the contact.
 */
const getContactById = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          contactId: {
            type: 'string',
            description: 'The whatsapp user\'s ID',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { contactId } = req.body
    const client = sessions.get(req.params.sessionId)
    const contact = await client.getContactById(contactId)
    res.json({ success: true, contact })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}



/**
 * Retrieves the state for a particular session.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The ID of the session to retrieve the state for.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error retrieving the state.
 */
const getState = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const state = await client.getState()
    res.json({ success: true, state })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}




module.exports = {
  getClassInfo,
  sendAllMessage,
  createGroup,
  getChatById,
  getChats,
  getContactById,
  getContacts,
  isRegisteredUser,
  getNumberId,
  getState,
  sendMessage,
  setStatus,
}
