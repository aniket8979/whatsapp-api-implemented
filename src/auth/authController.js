const bcrypt = require('bcrypt');
const Response = require('./utils/response');
const tokenService = require('./token/tokenService');
const sessionController = require('../controllers/sessionController')
const User = require('./Users/User');
const { validateSession } = require('../sessions')


const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        // Save user to database
        const userdata = new User({
            username: username,
            password: hashedPassword
        });
        const user = await User.findOne({ username });
        if (user) {
            console.log(user.username);
            return res.status(400).json(Response.responseFailure("username already exists"));
        }
        await userdata.save().then(() => {
            // Generate JWT token
            const token = tokenService.generateToken(userdata);
            res.status(201).json({
                success: true,
                message: "user saved",
                data: token
            });
        }).catch((err) => {
            console.log("from1");
            console.log(err);
            res.status(409).json({ error: 'Unable to register User' });
        });
    } catch (error) {
        console.log("from2");
        res.status(500).json(Response.responseFailure("unable to register user"));
    }
}


const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json(Response.responseFailure("Invalid credentials"));
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json(Response.responseFailure("Invalid credentials"));
        }
        const token = tokenService.generateToken(user, "");
        userData = {
            user: {
                userName: user.username,
                accounts: user.accounts,
                id: user._id
            },
            token: token  
        }
        res.json(Response.responseSuccess("Login successful", userData));
    } catch (error) {
        res.status(500).json(Response.responseFailure("Internal server error"));
    }
}




const activateSession = async (req, res) => {
    try {
        const newSesssionId = req.params.sessionId
        const user = await User.findOne({ _id: req.userId });
        if (!user) {
            return res.status(401).json(Response.responseFailure("Invalid token"));
        }
        if (user.accounts.includes(newSesssionId)) {
            const updatedToken = tokenService.generateToken(user, newSesssionId);
            return updatedToken;
        } else {
            return false
        }
    } catch (error) {
        res.status(500).json(Response.responseFailure("Internal server error"));
    }
}



const addNewAccount = async (req, res) => {
    try {
        const newSesssionId = req.params.phNumber;
        if (newSesssionId === undefined || isNaN(newSesssionId) || !/^\d{10}$/.test(newSesssionId) || newSesssionId === null) {
            return res.status(401).json(Response.responseFailure("Invalid phone number"));
        }
        const user = await User.findOne({ _id: req.userId });
        if (!user) {
            return res.status(401).json(Response.responseFailure("Invalid token"));
        }
        if (user.accounts.includes(newSesssionId)) {
            return res.status(401).json(Response.responseFailure("Already exists"));
        } else {
            user.accounts.push(newSesssionId);
            userData = {
                user: {
                    userName: user.username,
                    accounts: user.accounts,
                    id: user._id
                }
            }
            user.save().then(() => {
                res.json(Response.responseSuccess("Account added", userData));
            }).catch((err) => {
                console.log(err);
                res.status(409).json(Response.responseFailure("Unable to add account"));
            });
        }
    } catch (error) {
        res.status(500).json(Response.responseFailure("Internal server error"));
    }
}



const activeAccount = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId });
        if (!user) {
            return res.status(401).json(Response.responseFailure("Invalid token"));
        }
        let activeAccount;
        for (const account of user.accounts) {
            const sessionStatus = await validateSession(account);
            if (sessionStatus.success) {
               activeAccount = account
            }
        }
        res.json(Response.responseSuccess("active account", activeAccount));
    } catch (error) {
        res.status(500).json(Response.responseFailure("Internal server error"));
    }
}


module.exports = {
    register,
    login,
    activateSession,
    addNewAccount,
    activeAccount
}