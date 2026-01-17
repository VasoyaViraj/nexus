import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./src/db/db.js";
import User from "./src/models/User.model.js";
import Department from "./src/models/Department.model.js";
import Service from "./src/models/Service.model.js";

dotenv.config({
    path: './.env'
});

const seedDatabase = async () => {
    try {
        console.log("🌱 Starting database seed...");

        // Check if admin exists
        const adminExists = await User.findOne({ role: 'ADMIN' });
        if (!adminExists) {
            console.log('Creating admin user...');
            await User.create({
                email: 'admin@nexus.gov',
                password: 'admin123',
                name: 'System Admin',
                role: 'ADMIN'
            });
            console.log('Admin user created: admin@nexus.gov / admin123');
        } else {
            console.log('Admin user already exists.');
        }

        // Check if departments exist
        const deptCount = await Department.countDocuments();
        if (deptCount === 0) {
            console.log('Creating default departments...');

            const healthcareDept = await Department.create({
                name: 'Healthcare',
                description: 'Department of Health and Medical Services',
                code: 'HEALTHCARE',
                endpointBaseUrl: process.env.HEALTHCARE_URL || 'http://localhost:5001',
                icon: 'heart-pulse'
            });

            const agricultureDept = await Department.create({
                name: 'Agriculture',
                description: 'Department of Agriculture and Farming',
                code: 'AGRICULTURE',
                endpointBaseUrl: process.env.AGRICULTURE_URL || 'http://localhost:5002',
                icon: 'leaf'
            });

            console.log('Default departments created');

            // Create default services
            console.log('Creating default services...');
            await Service.create({
                name: 'Book Appointment',
                description: 'Schedule a medical appointment with a healthcare provider',
                departmentId: healthcareDept._id,
                endpointPath: '/internal/appointments',
                method: 'POST',
                icon: 'calendar-plus',
                formSchema: [
                    {
                        name: 'doctorType',
                        label: 'Type of Doctor',
                        type: 'select',
                        required: true,
                        options: [
                            { value: 'general', label: 'General Physician' },
                            { value: 'specialist', label: 'Specialist' },
                            { value: 'dentist', label: 'Dentist' },
                            { value: 'pediatrician', label: 'Pediatrician' }
                        ]
                    },
                    {
                        name: 'preferredDate',
                        label: 'Preferred Date',
                        type: 'date',
                        required: true
                    },
                    {
                        name: 'preferredTime',
                        label: 'Preferred Time',
                        type: 'select',
                        required: true,
                        options: [
                            { value: '09:00', label: '9:00 AM' },
                            { value: '10:00', label: '10:00 AM' },
                            { value: '11:00', label: '11:00 AM' },
                            { value: '14:00', label: '2:00 PM' },
                            { value: '15:00', label: '3:00 PM' },
                            { value: '16:00', label: '4:00 PM' }
                        ]
                    },
                    {
                        name: 'symptoms',
                        label: 'Symptoms / Reason for Visit',
                        type: 'textarea',
                        required: true,
                        placeholder: 'Describe your symptoms or reason for appointment'
                    }
                ]
            });

            await Service.create({
                name: 'Agriculture Advisory',
                description: 'Get expert advice on farming, crops, and agricultural practices',
                departmentId: agricultureDept._id,
                endpointPath: '/internal/advisory',
                method: 'POST',
                icon: 'message-circle',
                formSchema: [
                    {
                        name: 'cropType',
                        label: 'Crop Type',
                        type: 'select',
                        required: true,
                        options: [
                            { value: 'rice', label: 'Rice' },
                            { value: 'wheat', label: 'Wheat' },
                            { value: 'corn', label: 'Corn' },
                            { value: 'vegetables', label: 'Vegetables' },
                            { value: 'fruits', label: 'Fruits' },
                            { value: 'cotton', label: 'Cotton' },
                            { value: 'other', label: 'Other' }
                        ]
                    },
                    {
                        name: 'location',
                        label: 'Farm Location / District',
                        type: 'text',
                        required: true,
                        placeholder: 'Enter your farm location'
                    },
                    {
                        name: 'landSize',
                        label: 'Land Size (in acres)',
                        type: 'number',
                        required: true
                    },
                    {
                        name: 'problemDescription',
                        label: 'Problem Description',
                        type: 'textarea',
                        required: true,
                        placeholder: 'Describe your agricultural problem or query in detail'
                    }
                ]
            });

            console.log('Default services created');

            // Create department officers
            console.log('Creating department officers...');
            await User.create({
                email: 'officer.health@nexus.gov',
                password: 'officer123',
                name: 'Dr. Health Officer',
                role: 'DEPARTMENT_PERSON',
                departmentId: healthcareDept._id
            });

            await User.create({
                email: 'officer.agri@nexus.gov',
                password: 'officer123',
                name: 'Agri Officer',
                role: 'DEPARTMENT_PERSON',
                departmentId: agricultureDept._id
            });

            console.log('Department officers created');
            console.log('  Healthcare: officer.health@nexus.gov / officer123');
            console.log('  Agriculture: officer.agri@nexus.gov / officer123');
        } else {
            console.log('Departments already exist. Skipping default data creation.');
        }

        console.log("✅ Database seed completed successfully.");
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

const runSeed = async () => {
    try {
        await connectDB();
        await seedDatabase();
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to connect to database:", error);
        process.exit(1);
    }
};

runSeed();