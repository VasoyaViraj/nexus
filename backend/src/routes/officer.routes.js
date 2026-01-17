import express from 'express';
import Request from '../models/Request.model.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requireOfficer } from '../middlewares/role.middleware.js';
import { generateServiceJwt } from '../utils/serviceJwt.utils.js';

const router = express.Router();

// All officer routes require authentication and officer role
router.use(verifyToken);
router.use(requireOfficer);

// Get department requests (only for assigned department)
router.get('/requests', async (req, res) => {
    try {
        const { status, limit = 50 } = req.query;

        if (!req.user.departmentId) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to any department.'
            });
        }

        const filter = { departmentId: req.user.departmentId };
        if (status) {
            filter.status = status;
        }

        const requests = await Request.find(filter)
            .populate('citizenId', 'name email')
            .populate('serviceId', 'name icon')
            .populate('departmentId', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({ success: true, data: requests });
    } catch (error) {
        console.error('Get officer requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch requests.' });
    }
});

// Get request by ID
router.get('/requests/:id', async (req, res) => {
    try {
        const request = await Request.findOne({
            _id: req.params.id,
            departmentId: req.user.departmentId
        })
            .populate('citizenId', 'name email')
            .populate('serviceId', 'name icon formSchema')
            .populate('departmentId', 'name endpointBaseUrl code');

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found.' });
        }

        res.json({ success: true, data: request });
    } catch (error) {
        console.error('Get request error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch request.' });
    }
});

// Accept request
router.patch('/requests/:id/accept', async (req, res) => {
    try {
        const { remarks } = req.body;

        const request = await Request.findOne({
            _id: req.params.id,
            departmentId: req.user.departmentId
        }).populate('departmentId').populate('serviceId');

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found.' });
        }

        // Update request status
        request.status = 'ACCEPTED';
        request.officerRemarks = remarks || '';
        request.processedBy = req.userId;
        request.processedAt = new Date();

        // Notify microservice about status update
        try {
            const serviceJwt = generateServiceJwt(request.departmentId.code);
            const updateUrl = `${request.departmentId.endpointBaseUrl}/internal/update-status`;

            await fetch(updateUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${serviceJwt}`
                },
                body: JSON.stringify({
                    requestId: request._id.toString(),
                    status: 'ACCEPTED',
                    remarks: remarks || '',
                    processedBy: req.user.name
                })
            });
        } catch (notifyError) {
            console.error('Microservice notify error:', notifyError);
        }

        await request.save();

        res.json({
            success: true,
            message: 'Request accepted.',
            data: request
        });
    } catch (error) {
        console.error('Accept request error:', error);
        res.status(500).json({ success: false, message: 'Failed to accept request.' });
    }
});

// Reject request
router.patch('/requests/:id/reject', async (req, res) => {
    try {
        const { remarks } = req.body;

        if (!remarks) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required.'
            });
        }

        const request = await Request.findOne({
            _id: req.params.id,
            departmentId: req.user.departmentId
        }).populate('departmentId');

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found.' });
        }

        request.status = 'REJECTED';
        request.officerRemarks = remarks;
        request.processedBy = req.userId;
        request.processedAt = new Date();

        // Notify microservice
        try {
            const serviceJwt = generateServiceJwt(request.departmentId.code);
            const updateUrl = `${request.departmentId.endpointBaseUrl}/internal/update-status`;

            await fetch(updateUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${serviceJwt}`
                },
                body: JSON.stringify({
                    requestId: request._id.toString(),
                    status: 'REJECTED',
                    remarks: remarks,
                    processedBy: req.user.name
                })
            });
        } catch (notifyError) {
            console.error('Microservice notify error:', notifyError);
        }

        await request.save();

        res.json({
            success: true,
            message: 'Request rejected.',
            data: request
        });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject request.' });
    }
});

// Get department statistics
router.get('/stats', async (req, res) => {
    try {
        if (!req.user.departmentId) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to any department.'
            });
        }

        const [total, pending, accepted, rejected] = await Promise.all([
            Request.countDocuments({ departmentId: req.user.departmentId }),
            Request.countDocuments({ departmentId: req.user.departmentId, status: 'PENDING' }),
            Request.countDocuments({ departmentId: req.user.departmentId, status: 'ACCEPTED' }),
            Request.countDocuments({ departmentId: req.user.departmentId, status: 'REJECTED' })
        ]);

        res.json({
            success: true,
            data: { total, pending, accepted, rejected }
        });
    } catch (error) {
        console.error('Get officer stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch statistics.' });
    }
});

export default router;
