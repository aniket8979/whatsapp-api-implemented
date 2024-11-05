const express = require('express')
const routes = express.Router()
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../swagger.json')
const { enableLocalCallbackExample, enableSwaggerEndpoint } = require('./config')

const middleware = require('./middleware')
const healthController = require('./controllers/healthController')
const sessionController = require('./controllers/sessionController')
const clientController = require('./controllers/clientController')
const chatController = require('./controllers/chatController')
const groupChatController = require('./controllers/groupChatController')
const messageController = require('./controllers/messageController')
const contactController = require('./controllers/contactController')
const authController = require('./auth/authController');

/**
 * ================
 * HEALTH ENDPOINTS
 * ================
 */

// API endpoint to check if server is alive
routes.get('/ping', healthController.ping)
// API basic callback
if (enableLocalCallbackExample) {
  routes.post('/localCallbackExample', [middleware.apikey, middleware.rateLimiter], healthController.localCallbackExample)
}


/**
 * ================
 * LOGIN & REGISTER
 * ================
 */

const authRouter = express.Router()
routes.use('/auth', authRouter)

authRouter.post('/login', authController.login)
authRouter.post('/register', authController.register)



/**
 * ================
 * SESSION ENDPOINTS
 * ================
 */
const sessionRouter = express.Router()
sessionRouter.use(middleware.apikey)
sessionRouter.use(middleware.sessionSwagger)
routes.use('/session', sessionRouter)

sessionRouter.get('/start/:sessionId', middleware.sessionNameValidation, sessionController.startSession)
sessionRouter.get('/status/:sessionId', middleware.sessionNameValidation, sessionController.statusSession)
sessionRouter.get('/qr/:sessionId', middleware.sessionNameValidation, sessionController.sessionQrCode)
sessionRouter.get('/qr/:sessionId/image', middleware.sessionNameValidation, sessionController.sessionQrCodeImage)
sessionRouter.get('/restart/:sessionId', middleware.sessionNameValidation, sessionController.restartSession)
sessionRouter.get('/terminate/:sessionId', middleware.sessionNameValidation, sessionController.terminateSession)
sessionRouter.get('/terminateInactive', sessionController.terminateInactiveSessions)
sessionRouter.get('/terminateAll', sessionController.terminateAllSessions)

/**
 * ================
 * CLIENT ENDPOINTS
 * ================
 */

const clientRouter = express.Router()
clientRouter.use(middleware.apikey)
sessionRouter.use(middleware.clientSwagger)
routes.use('/client', clientRouter)
clientRouter.get('/sendMessageAll/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.sendAllMessage)
clientRouter.get('/getClassInfo/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getClassInfo)
clientRouter.post('/createGroup/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.createGroup)
clientRouter.post('/getChatById/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getChatById)
clientRouter.get('/getChats/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getChats)
clientRouter.post('/getContactById/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getContactById)
clientRouter.get('/getContacts/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getContacts)
clientRouter.post('/getNumberId/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getNumberId)
clientRouter.post('/isRegisteredUser/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.isRegisteredUser)
clientRouter.get('/getState/:sessionId', [middleware.sessionNameValidation], clientController.getState)
clientRouter.post('/sendMessage/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.sendMessage)
clientRouter.post('/setStatus/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.setStatus)

/**
 * ================
 * CHAT ENDPOINTS
 * ================
 */
const chatRouter = express.Router()
chatRouter.use(middleware.apikey)
sessionRouter.use(middleware.chatSwagger)
routes.use('/chat', chatRouter)

chatRouter.post('/getClassInfo/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], chatController.getClassInfo)
chatRouter.post('/clearMessages/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], chatController.clearMessages)
chatRouter.post('/delete/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], chatController.deleteChat)
chatRouter.post('/fetchMessages/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], chatController.fetchMessages)
chatRouter.post('/getContact/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], chatController.getContact)

/**
 * ================
 * GROUP CHAT ENDPOINTS
 * ================
 */
const groupChatRouter = express.Router()
groupChatRouter.use(middleware.apikey)
sessionRouter.use(middleware.groupChatSwagger)
routes.use('/groupChat', groupChatRouter)

groupChatRouter.post('/getClassInfo/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.getClassInfo)
groupChatRouter.post('/addParticipants/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.addParticipants)
groupChatRouter.post('/getInviteCode/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.getInviteCode)
groupChatRouter.post('/leave/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.leave)
groupChatRouter.post('/removeParticipants/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.removeParticipants)
groupChatRouter.post('/setDescription/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.setDescription)
groupChatRouter.post('/setInfoAdminsOnly/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.setInfoAdminsOnly)
groupChatRouter.post('/setMessagesAdminsOnly/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.setMessagesAdminsOnly)
groupChatRouter.post('/setSubject/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.setSubject)
groupChatRouter.post('/setPicture/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.setPicture)
groupChatRouter.post('/deletePicture/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.deletePicture)

/**
 * ================
 * MESSAGE ENDPOINTS
 * ================
 */
const messageRouter = express.Router()
messageRouter.use(middleware.apikey)
sessionRouter.use(middleware.messageSwagger)
routes.use('/message', messageRouter)

messageRouter.post('/getClassInfo/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.getClassInfo)
messageRouter.post('/delete/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.deleteMessage)
messageRouter.post('/downloadMedia/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.downloadMedia)
messageRouter.post('/getInfo/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.getInfo)
messageRouter.post('/reply/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.reply)

/**
 * ================
 * MESSAGE ENDPOINTS
 * ================
 */
const contactRouter = express.Router()
contactRouter.use(middleware.apikey)
sessionRouter.use(middleware.contactSwagger)
routes.use('/contact', contactRouter)

contactRouter.post('/getClassInfo/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.getClassInfo)
contactRouter.post('/block/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.block)
contactRouter.post('/getAbout/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.getAbout)
contactRouter.post('/getChat/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.getChat)
contactRouter.post('/unblock/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.unblock)
contactRouter.post('/getFormattedNumber/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.getFormattedNumber)
contactRouter.post('/getCountryCode/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.getCountryCode)
contactRouter.post('/getProfilePicUrl/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.getProfilePicUrl)
/**
 * ================
 * SWAGGER ENDPOINTS
 * ================
 */
if (enableSwaggerEndpoint) {
  routes.use('/api-docs', swaggerUi.serve)
  routes.get('/api-docs', swaggerUi.setup(swaggerDocument) /* #swagger.ignore = true */)
}

module.exports = { routes }
