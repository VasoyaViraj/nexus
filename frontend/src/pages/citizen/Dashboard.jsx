import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { citizenAPI } from '../../lib/api';
import Layout from '../../components/layout/Layout';
import {
    Building2,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight,
    CalendarDays,
    TrendingUp,
    Sparkles,
    Bell,
    Search,
    ChevronRight,
    Activity
} from 'lucide-react';

export default function CitizenDashboard() {
    const { user } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [deptRes, reqRes] = await Promise.all([
                citizenAPI.getDepartments(),
                citizenAPI.getRecentAppointments()
            ]);
            setDepartments(deptRes.data.data || []);
            setRecentRequests(reqRes.data.data || []);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            PENDING: { 
                bg: 'bg-amber-50 border-amber-200', 
                text: 'text-amber-700',
                icon: Clock 
            },
            ACCEPTED: { 
                bg: 'bg-emerald-50 border-emerald-200', 
                text: 'text-emerald-700',
                icon: CheckCircle2 
            },
            REJECTED: { 
                bg: 'bg-red-50 border-red-200', 
                text: 'text-red-700',
                icon: XCircle 
            },
            PROCESSING: { 
                bg: 'bg-blue-50 border-blue-200', 
                text: 'text-blue-700',
                icon: TrendingUp 
            },
        };
        const { bg, text, icon: Icon } = config[status] || config.PENDING;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${bg} ${text}`}>
                <Icon size={12} />
                {status.charAt(0) + status.slice(1).toLowerCase()}
            </span>
        );
    };

    const departmentIcons = {
        'heart-pulse': { emoji: '🏥', bg: 'bg-rose-50', border: 'border-rose-100' },
        'leaf': { emoji: '🌿', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        'building': { emoji: '🏛️', bg: 'bg-blue-50', border: 'border-blue-100' },
        'calendar-plus': { emoji: '📅', bg: 'bg-purple-50', border: 'border-purple-100' },
        'message-circle': { emoji: '💬', bg: 'bg-cyan-50', border: 'border-cyan-100' },
        'default': { emoji: '📋', bg: 'bg-gray-50', border: 'border-gray-100' }
    };

    const getIconConfig = (iconName) => departmentIcons[iconName] || departmentIcons.default;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-gray-500 text-sm">Loading your dashboard...</p>
                </div>
            </Layout>
        );
    }

    const pendingCount = recentRequests.filter(r => r.status === 'PENDING').length;
    const approvedCount = recentRequests.filter(r => r.status === 'ACCEPTED').length;

    return (
        <Layout>
            {/* Hero Welcome Section */}
            <div className="relative mb-8 overflow-hidden">
                <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 text-white">
                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }} />
                    </div>
                    
                    <div className="relative">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 text-blue-300 text-sm mb-2">
                                    <Sparkles size={16} />
                                    <span>{getGreeting()}</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                    Welcome back, {user?.name?.split(' ')[0]}!
                                </h1>
                                <p className="text-slate-300 text-lg">
                                    Access government services and track your requests
                                </p>
                            </div>
                            
                            {/* Quick action buttons */}
                            <div className="flex gap-3">
                                <Link
                                    to="/departments"
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl transition-all border border-white/10"
                                >
                                    <Search size={18} />
                                    <span className="font-medium">Find Services</span>
                                </Link>
                                {/* <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl transition-all relative">
                                    <Bell size={18} />
                                    {pendingCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {pendingCount}
                                        </span>
                                    )}
                                </button> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="group bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Departments</p>
                            <p className="text-4xl font-bold text-gray-900">{departments.length}</p>
                            <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                                <Activity size={14} />
                                All active
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                            <Building2 className="text-blue-600" size={26} />
                        </div>
                    </div>
                </div>

                <div className="group bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Approved</p>
                            <p className="text-4xl font-bold text-gray-900">{approvedCount}</p>
                            <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                                <CheckCircle2 size={14} />
                                Completed
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-emerald-50 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-colors">
                            <CheckCircle2 className="text-emerald-600" size={26} />
                        </div>
                    </div>
                </div>

                <div className="group bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
                            <p className="text-4xl font-bold text-gray-900">{pendingCount}</p>
                            <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                                <Clock size={14} />
                                Awaiting review
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-amber-50 group-hover:bg-amber-100 rounded-xl flex items-center justify-center transition-colors">
                            <Clock className="text-amber-600" size={26} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Departments - Takes more space */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Building2 className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">Departments</h2>
                                <p className="text-xs text-gray-500">Browse available services</p>
                            </div>
                        </div>
                        <Link 
                            to="/departments" 
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                        >
                            View all <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="p-4">
                        <div className="space-y-2">
                            {departments.slice(0, 5).map((dept) => {
                                const iconConfig = getIconConfig(dept.icon);
                                return (
                                    <Link
                                        key={dept._id}
                                        to={`/departments/${dept._id}`}
                                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100"
                                    >
                                        <div className={`w-12 h-12 ${iconConfig.bg} ${iconConfig.border} border rounded-xl flex items-center justify-center text-xl group-hover:scale-105 transition-transform`}>
                                            {iconConfig.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {dept.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-1">{dept.description}</p>
                                        </div>
                                        <ArrowRight className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={18} />
                                    </Link>
                                );
                            })}
                            {departments.length === 0 && (
                                <div className="text-center py-12">
                                    <Building2 className="text-gray-200 mx-auto mb-3" size={48} />
                                    <p className="text-gray-500">No departments available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Requests */}
                <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                <FileText className="text-purple-600" size={20} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">Recent Requests</h2>
                                <p className="text-xs text-gray-500">Track your application status</p>
                            </div>
                        </div>
                        <Link 
                            to="/requests" 
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                        >
                            View all <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="p-4">
                        {recentRequests.length > 0 ? (
                            <div className="space-y-2">
                                {recentRequests.slice(0, 5).map((request) => {
                                    const iconConfig = getIconConfig(request.serviceId?.icon);
                                    return (
                                        <Link
                                            key={request._id}
                                            to={`/requests/${request._id}`}
                                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100"
                                        >
                                            <div className={`w-12 h-12 ${iconConfig.bg} ${iconConfig.border} border rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform`}>
                                                {iconConfig.emoji}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 truncate transition-colors">
                                                    {request.serviceId?.name || 'Service Request'}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                                        <CalendarDays size={13} className="text-gray-400" />
                                                        {new Date(request.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                    <span className="text-gray-300">•</span>
                                                    <p className="text-sm text-gray-500">
                                                        {request.departmentId?.name || 'Department'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {getStatusBadge(request.status)}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FileText className="text-gray-300" size={32} />
                                </div>
                                <h3 className="font-medium text-gray-900 mb-1">No requests yet</h3>
                                <p className="text-gray-500 text-sm mb-4">Start by browsing available services</p>
                                <Link 
                                    to="/departments" 
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                                >
                                    <Search size={18} />
                                    Browse Services
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Help Section */}
            <div className="mt-8 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Need help with a service?</h3>
                        <p className="text-gray-600 text-sm">Our support team is available to assist you with any questions</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                            View FAQs
                        </button>
                        <button className="px-5 py-2.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}