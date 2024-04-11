const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const token = jwt.sign({user : userId}, process.env.JWT_SECRET);
  return token;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
