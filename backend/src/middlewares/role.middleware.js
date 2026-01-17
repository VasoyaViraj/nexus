export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

export const requireAdmin = requireRole('ADMIN');
export const requireCitizen = requireRole('CITIZEN');
export const requireOfficer = requireRole('DEPARTMENT_PERSON');
export const requireAdminOrOfficer = requireRole('ADMIN', 'DEPARTMENT_PERSON');
