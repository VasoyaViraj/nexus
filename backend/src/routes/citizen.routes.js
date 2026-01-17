import express from 'express';
import Department from '../models/Department.model.js';
import Service from '../models/Service.model.js';
import Request from '../models/Request.model.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { generateServiceJwt } from '../utils/serviceJwt.utils.js';

const router = express.Router();

// All citizen routes require authentication
router.use(verifyToken);

// ============ DEPARTMENTS ============

// Get active departments
router.get('/departments', async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, data: departments });
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch departments.' });
    }
});

// Get department by ID
router.get('/departments/:id', async (req, res) => {
    try {
        const department = await Department.findOne({ _id: req.params.id, isActive: true });

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found.' });
        }

        res.json({ success: true, data: department });
    } catch (error) {
        console.error('Get department error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch department.' });
    }
});

// Get services for a department
router.get('/departments/:id/services', async (req, res) => {
    try {
        const department = await Department.findOne({ _id: req.params.id, isActive: true });

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found.' });
        }

        const services = await Service.find({
            departmentId: req.params.id,
            isActive: true
        }).sort({ name: 1 });

        res.json({ success: true, data: { department, services } });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch services.' });
    }
});

// ============ SERVICES ============

// Get service by ID (with form schema)
router.get('/services/:id', async (req, res) => {
    try {
        const service = await Service.findOne({
            _id: req.params.id,
            isActive: true
        }).populate('departmentId');

        if (!service || !service.departmentId.isActive) {
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }

        res.json({ success: true, data: service });
    } catch (error) {
        console.error('Get service error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch service.' });
    }
});

// ============ REQUESTS ============

// Submit a new request
router.post('/requests', async (req, res) => {
    try {
        const { serviceId, payload } = req.body;

        if (!serviceId) {
            return res.status(400).json({ success: false, message: 'Service ID is required.' });
        }

        // Get service and department
        const service = await Service.findOne({ _id: serviceId, isActive: true }).populate('departmentId');

        if (!service || !service.departmentId.isActive) {
            return res.status(400).json({ success: false, message: 'Service not available.' });
        }

        // Create request in Nexus DB
        const request = new Request({
            citizenId: req.userId,
            serviceId,
            departmentId: service.departmentId._id,
            payload: payload || {},
            status: 'PENDING'
        });

        await request.save();

        // Forward request to microservice
        try {
            const serviceJwt = generateServiceJwt(service.departmentId.code);
            const citizenToken = req.headers.authorization?.split(' ')[1];

            const microserviceUrl = `${service.departmentId.endpointBaseUrl}${service.endpointPath}`;

            const response = await fetch(microserviceUrl, {
                method: service.method || 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${serviceJwt}`,
                    'X-Citizen-Token': citizenToken,
                    'X-Request-Id': request._id.toString(),
                    'X-Citizen-Id': req.userId.toString()
                },
                body: JSON.stringify({
                    requestId: request._id.toString(),
                    serviceId: serviceId,
                    serviceName: service.name,
                    citizenId: req.userId.toString(),
                    citizenName: req.user.name,
                    citizenEmail: req.user.email,
                    data: payload || {}
                })
            });

            const microserviceResponse = await response.json();

            // Update request with microservice response
            if (microserviceResponse.status) {
                request.status = microserviceResponse.status;
            }
            if (microserviceResponse.remarks) {
                request.officerRemarks = microserviceResponse.remarks;
            }
            if (microserviceResponse.responseData) {
                request.responseData = microserviceResponse.responseData;
            }

            await request.save();

        } catch (forwardError) {
            console.error('Microservice forward error:', forwardError);
            // Request remains PENDING if microservice is unavailable
        }

        // Populate and return
        const populatedRequest = await Request.findById(request._id)
            .populate('serviceId', 'name icon')
            .populate('departmentId', 'name icon');

        res.status(201).json({
            success: true,
            message: 'Request submitted successfully.',
            data: populatedRequest
        });
    } catch (error) {
        console.error('Submit request error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit request.' });
    }
});

// Get citizen's requests
router.get('/requests', async (req, res) => {
    try {
        const { limit = 10, status } = req.query;
        const filter = { citizenId: req.userId };

        if (status) {
            filter.status = status;
        }

        const requests = await Request.find(filter)
            .populate('serviceId', 'name icon')
            .populate('departmentId', 'name icon')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({ success: true, data: requests });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch requests.' });
    }
});

// Get request by ID
router.get('/requests/:id', async (req, res) => {
    try {
        const request = await Request.findOne({
            _id: req.params.id,
            citizenId: req.userId
        })
            .populate('serviceId', 'name icon description')
            .populate('departmentId', 'name icon');

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found.' });
        }

        res.json({ success: true, data: request });
    } catch (error) {
        console.error('Get request error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch request.' });
    }
});

// Get recent appointments (last 5)
router.get('/recent-appointments', async (req, res) => {
    try {
        const requests = await Request.find({ citizenId: req.userId })
            .populate('serviceId', 'name icon')
            .populate('departmentId', 'name icon')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({ success: true, data: requests });
    } catch (error) {
        console.error('Get recent appointments error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch appointments.' });
    }
});

export default router;
