const { verifyToken } = require('../utils/auth.util')

const auth = async (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
      try {
        const decoded = verifyToken(token.split(' ')[1]);
        req.user = decoded.user;
        next();
      } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
      }
    } else {
      res.status(401).json({ error: 'No token provided' });
}
}

module.exports = auth