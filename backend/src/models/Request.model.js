import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
    citizenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'PROCESSING'],
        default: 'PENDING'
    },
    officerRemarks: {
        type: String,
        default: ''
    },
    responseData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    processedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Index for citizen lookups
requestSchema.index({ citizenId: 1, createdAt: -1 });
// Index for department lookups
requestSchema.index({ departmentId: 1, status: 1 });

const Request = mongoose.model('Request', requestSchema);

export default Request;
