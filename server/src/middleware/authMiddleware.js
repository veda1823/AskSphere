const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

/**
 * Authentication Middleware:
 * Protects endpoints by verifying the incoming JSON Web Token (JWT)
 * in the "Authorization: Bearer <token>" header.
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <TOKEN>"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    // Verify token validity and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retrieve the user from database (excluding sensitive password field)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        points: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: User no longer exists.',
      });
    }

    // Attach user payload to the request object for downstream controllers
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};

module.exports = authenticateToken;
