import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    endpointPath: {
        type: String,
        required: true
    },
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        default: 'POST'
    },
    formSchema: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },
    icon: {
        type: String,
        default: 'file-text'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Compound index for unique service name per department
serviceSchema.index({ name: 1, departmentId: 1 }, { unique: true });

const Service = mongoose.model('Service', serviceSchema);

export default Service;
