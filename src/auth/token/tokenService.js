const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach decoded payload to the request
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

const generateToken = (user) => {
    const payload = {
        userId: user._id
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' }); // Adjust expiration as needed
};

module.exports = {
    verifyToken,
    generateToken
};