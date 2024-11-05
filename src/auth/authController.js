const bcrypt = require('bcrypt');
const Response = require('./utils/response');
const tokenService = require('./token/tokenService');
const  User  = require('./Users/User');


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
            return res.status(400).json(Response.responseFailure("username already exists"));
        }
        await userdata.save().then(() => {
            // Generate JWT token
            const token = tokenService.generateToken(userdata);
            res.status(201).json(Response.responseSuccess("user saved", token));
        }).catch((err) => {
            res.status(409).json({ error: 'Unable to register User' });
        });
    } catch (error) {
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
        const token = tokenService.generateToken(user);
        res.json(Response.responseSuccess("Login successful", token));
    } catch (error) {
        res.status(500).json(Response.responseFailure("Internal server error"));
    }
}

module.exports = {
    register,
    login
}