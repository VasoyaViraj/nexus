import jwt from 'jsonwebtoken';

/**
 * Generate a Service-to-Service JWT for secure microservice communication
 * @param {string} targetDepartment - Department code (e.g., 'HEALTHCARE', 'AGRICULTURE')
 * @param {string[]} scopes - Array of allowed scopes (e.g., ['FORWARD_REQUEST'])
 * @returns {string} Signed JWT token
 */
export const generateServiceJwt = (targetDepartment, scopes = ['FORWARD_REQUEST']) => {
    const payload = {
        issuer: 'NEXUS',
        service: 'NEXUS_GATEWAY',
        department: targetDepartment,
        scope: scopes,
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, process.env.SERVICE_JWT_SECRET, {
        expiresIn: '5m' // Short-lived for security
    });
};

/**
 * Verify a Service JWT (used by microservices)
 * @param {string} token - The service JWT to verify
 * @returns {object|null} Decoded payload or null if invalid
 */
export const verifyServiceJwt = (token) => {
    try {
        return jwt.verify(token, process.env.SERVICE_JWT_SECRET);
    } catch (error) {
        return null;
    }
};
