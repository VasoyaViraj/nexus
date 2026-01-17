import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    endpointBaseUrl: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: 'building'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);

export default Department;
