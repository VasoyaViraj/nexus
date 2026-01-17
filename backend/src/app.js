import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))

// Body parsing middleware
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static("public"))
app.use(cookieParser())

// Import routes
import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'
import citizenRoutes from './routes/citizen.routes.js'
import officerRoutes from './routes/officer.routes.js'

// Mount routes
app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/citizen", citizenRoutes)
app.use("/api/officer", officerRoutes)

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "UP", service: "Nexus Gateway", timestamp: new Date().toISOString() })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found.' })
})

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err)
    res.status(500).json({ success: false, message: 'Internal server error.' })
})

export { app }