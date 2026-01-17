import express from 'express';
import Department from '../models/Department.model.js';
import Service from '../models/Service.model.js';
import User from '../models/User.model.js';
import Request from '../models/Request.model.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(requireAdmin);

// ============ DEPARTMENT MANAGEMENT ============

// Get all departments
router.get('/departments', async (req, res) => {
    try {
        const departments = await Department.find().sort({ createdAt: -1 });
        res.json({ success: true, data: departments });
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch departments.' });
    }
});

// Create department
router.post('/departments', async (req, res) => {
    try {
        const { name, description, code, endpointBaseUrl, icon } = req.body;

        if (!name || !code || !endpointBaseUrl) {
            return res.status(400).json({
                success: false,
                message: 'Name, code, and endpoint URL are required.'
            });
        }

        const department = new Department({
            name,
            description,
            code: code.toUpperCase(),
            endpointBaseUrl,
            icon
        });

        await department.save();

        res.status(201).json({
            success: true,
            message: 'Department created successfully.',
            data: department
        });
    } catch (error) {
        console.error('Create department error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Department name or code already exists.'
            });
        }
        res.status(500).json({ success: false, message: 'Failed to create department.' });
    }
});

// Update department
router.put('/departments/:id', async (req, res) => {
    try {
        const { name, description, endpointBaseUrl, icon } = req.body;

        const department = await Department.findByIdAndUpdate(
            req.params.id,
            { name, description, endpointBaseUrl, icon },
            { new: true, runValidators: true }
        );

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found.' });
        }

        res.json({ success: true, message: 'Department updated.', data: department });
    } catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({ success: false, message: 'Failed to update department.' });
    }
});

// Enable department
router.patch('/departments/:id/enable', async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            { isActive: true },
            { new: true }
        );

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found.' });
        }

        res.json({ success: true, message: 'Department enabled.', data: department });
    } catch (error) {
        console.error('Enable department error:', error);
        res.status(500).json({ success: false, message: 'Failed to enable department.' });
    }
});

// Disable department
router.patch('/departments/:id/disable', async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found.' });
        }

        // Also disable all services under this department
        await Service.updateMany({ departmentId: req.params.id }, { isActive: false });

        res.json({ success: true, message: 'Department and its services disabled.', data: department });
    } catch (error) {
        console.error('Disable department error:', error);
        res.status(500).json({ success: false, message: 'Failed to disable department.' });
    }
});

// Delete department
router.delete('/departments/:id', async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found.' });
        }

        // Delete all services under this department
        await Service.deleteMany({ departmentId: req.params.id });

        res.json({ success: true, message: 'Department and services deleted.' });
    } catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete department.' });
    }
});

// ============ SERVICE MANAGEMENT ============

// Get all services
router.get('/services', async (req, res) => {
    try {
        const services = await Service.find().populate('departmentId').sort({ createdAt: -1 });
        res.json({ success: true, data: services });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch services.' });
    }
});

// Create service
router.post('/services', async (req, res) => {
    try {
        const { name, description, departmentId, endpointPath, method, formSchema, icon } = req.body;

        if (!name || !departmentId || !endpointPath) {
            return res.status(400).json({
                success: false,
                message: 'Name, department, and endpoint path are required.'
            });
        }

        // Verify department exists
        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(400).json({ success: false, message: 'Department not found.' });
        }

        const service = new Service({
            name,
            description,
            departmentId,
            endpointPath,
            method: method || 'POST',
            formSchema: formSchema || [],
            icon
        });

        await service.save();

        const populatedService = await Service.findById(service._id).populate('departmentId');

        res.status(201).json({
            success: true,
            message: 'Service created successfully.',
            data: populatedService
        });
    } catch (error) {
        console.error('Create service error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Service name already exists in this department.'
            });
        }
        res.status(500).json({ success: false, message: 'Failed to create service.' });
    }
});

// Update service
router.put('/services/:id', async (req, res) => {
    try {
        const { name, description, endpointPath, method, formSchema, icon } = req.body;

        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { name, description, endpointPath, method, formSchema, icon },
            { new: true, runValidators: true }
        ).populate('departmentId');

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }

        res.json({ success: true, message: 'Service updated.', data: service });
    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({ success: false, message: 'Failed to update service.' });
    }
});

// Enable service
router.patch('/services/:id/enable', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('departmentId');

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }

        // Check if parent department is active
        if (!service.departmentId.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Cannot enable service. Parent department is disabled.'
            });
        }

        service.isActive = true;
        await service.save();

        res.json({ success: true, message: 'Service enabled.', data: service });
    } catch (error) {
        console.error('Enable service error:', error);
        res.status(500).json({ success: false, message: 'Failed to enable service.' });
    }
});

// Disable service
router.patch('/services/:id/disable', async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        ).populate('departmentId');

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }

        res.json({ success: true, message: 'Service disabled.', data: service });
    } catch (error) {
        console.error('Disable service error:', error);
        res.status(500).json({ success: false, message: 'Failed to disable service.' });
    }
});

// Delete service
router.delete('/services/:id', async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }

        res.json({ success: true, message: 'Service deleted.' });
    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete service.' });
    }
});

// ============ USER MANAGEMENT ============

// Get all users
router.get('/users', async (req, res) => {
    try {
        const { role } = req.query;
        const filter = role ? { role } : {};
        const users = await User.find(filter).populate('departmentId').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users.' });
    }
});

// Create user (admin can create officers)
router.post('/users', async (req, res) => {
    try {
        const { email, password, name, role, departmentId } = req.body;

        if (!email || !password || !name || !role) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        if (role === 'DEPARTMENT_PERSON' && !departmentId) {
            return res.status(400).json({
                success: false,
                message: 'Department is required for department officers.'
            });
        }

        const user = new User({
            email,
            password,
            name,
            role,
            departmentId: role === 'DEPARTMENT_PERSON' ? departmentId : null
        });

        await user.save();

        const populatedUser = await User.findById(user._id).populate('departmentId');

        res.status(201).json({
            success: true,
            message: 'User created successfully.',
            data: populatedUser
        });
    } catch (error) {
        console.error('Create user error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email already exists.' });
        }
        res.status(500).json({ success: false, message: 'Failed to create user.' });
    }
});

// Toggle user active status
router.patch('/users/:id/toggle', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'}.`,
            data: user
        });
    } catch (error) {
        console.error('Toggle user error:', error);
        res.status(500).json({ success: false, message: 'Failed to toggle user status.' });
    }
});

// ============ STATISTICS ============

// Get system statistics
router.get('/stats', async (req, res) => {
    try {
        const [
            totalDepartments,
            activeDepartments,
            totalServices,
            activeServices,
            totalUsers,
            totalRequests,
            pendingRequests,
            acceptedRequests,
            rejectedRequests
        ] = await Promise.all([
            Department.countDocuments(),
            Department.countDocuments({ isActive: true }),
            Service.countDocuments(),
            Service.countDocuments({ isActive: true }),
            User.countDocuments(),
            Request.countDocuments(),
            Request.countDocuments({ status: 'PENDING' }),
            Request.countDocuments({ status: 'ACCEPTED' }),
            Request.countDocuments({ status: 'REJECTED' })
        ]);

        // Get requests per department
        const requestsByDepartment = await Request.aggregate([
            {
                $group: {
                    _id: '$departmentId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            { $unwind: '$department' },
            {
                $project: {
                    departmentName: '$department.name',
                    count: 1
                }
            }
        ]);

        // Recent requests
        const recentRequests = await Request.find()
            .populate('citizenId', 'name email')
            .populate('serviceId', 'name')
            .populate('departmentId', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                departments: { total: totalDepartments, active: activeDepartments },
                services: { total: totalServices, active: activeServices },
                users: { total: totalUsers },
                requests: {
                    total: totalRequests,
                    pending: pendingRequests,
                    accepted: acceptedRequests,
                    rejected: rejectedRequests
                },
                requestsByDepartment,
                recentRequests
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch statistics.' });
    }
});

export default router;
