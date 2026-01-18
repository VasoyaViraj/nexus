import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../lib/api';
import Layout from '../../components/layout/Layout';
import {
    Building2, Settings, Users, FileText,
    CheckCircle2, Clock, XCircle,
    ChevronRight, AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await adminAPI.getStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
            ACCEPTED: 'bg-green-50 text-green-800 border border-green-200',
            REJECTED: 'bg-red-50 text-red-800 border border-red-200',
        };
        const icons = {
            PENDING: <Clock size={12} />,
            ACCEPTED: <CheckCircle2 size={12} />,
            REJECTED: <XCircle size={12} />,
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${styles[status] || 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                {icons[status]}
                {status.charAt(0) + status.slice(1).toLowerCase()}
            </span>
        );
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-3 text-gray-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
                        <span>Loading dashboard...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Simple Header */}
            <div className="mb-8">
                {/* <div className="border-l-4 border-blue-600 pl-4"> */}
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                {/* </div> */}
            </div>

            {/* Stats Grid - Clean Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Departments</p>
                            <p className="text-3xl font-semibold text-gray-900 mt-1">
                                {stats?.departments?.total || 0}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                <span className="text-green-700 font-medium">{stats?.departments?.active || 0}</span> active
                            </p>
                        </div>
                        <div className="p-2.5 bg-blue-50 rounded-lg">
                            <Building2 className="text-blue-600" size={22} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Services</p>
                            <p className="text-3xl font-semibold text-gray-900 mt-1">
                                {stats?.services?.total || 0}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                <span className="text-green-700 font-medium">{stats?.services?.active || 0}</span> active
                            </p>
                        </div>
                        <div className="p-2.5 bg-blue-50 rounded-lg">
                            <Settings className="text-blue-600" size={22} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-3xl font-semibold text-gray-900 mt-1">
                                {stats?.users?.total || 0}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Registered citizens</p>
                        </div>
                        <div className="p-2.5 bg-blue-50 rounded-lg">
                            <Users className="text-blue-600" size={22} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Requests</p>
                            <p className="text-3xl font-semibold text-gray-900 mt-1">
                                {stats?.requests?.total || 0}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                <span className="text-yellow-700 font-medium">{stats?.requests?.pending || 0}</span> pending
                            </p>
                        </div>
                        <div className="p-2.5 bg-blue-50 rounded-lg">
                            <FileText className="text-blue-600" size={22} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Request Status Summary - Subtle Colors */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Request Status Summary</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    <div className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-50 rounded">
                                <Clock className="text-yellow-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-900">{stats?.requests?.pending || 0}</p>
                                <p className="text-sm text-gray-600">Pending Review</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded">
                                <CheckCircle2 className="text-green-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-900">{stats?.requests?.accepted || 0}</p>
                                <p className="text-sm text-gray-600">Approved</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 rounded">
                                <XCircle className="text-red-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-900">{stats?.requests?.rejected || 0}</p>
                                <p className="text-sm text-gray-600">Rejected</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Requests by Department */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Requests by Department</h2>
                    </div>
                    <div className="p-5">
                        {stats?.requestsByDepartment?.length > 0 ? (
                            <div className="space-y-4">
                                {stats.requestsByDepartment.map((item, index) => {
                                    const maxCount = Math.max(...stats.requestsByDepartment.map(d => d.count));
                                    const percentage = (item.count / maxCount) * 100;
                                    return (
                                        <div key={index}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm text-gray-700">{item.departmentName}</span>
                                                <span className="text-sm font-medium text-gray-900">{item.count}</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded">
                                                <div
                                                    className="h-full bg-blue-600 rounded"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <AlertCircle className="mx-auto mb-2 text-gray-400" size={24} />
                                <p className="text-sm">No data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Requests */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Recent Requests</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {stats?.recentRequests?.slice(0, 5).map((request) => (
                            <div key={request._id} className="px-5 py-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {request.serviceId?.name}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate mt-0.5">
                                            {request.citizenId?.name}
                                        </p>
                                    </div>
                                    {getStatusBadge(request.status)}
                                </div>
                            </div>
                        ))}
                        {(!stats?.recentRequests || stats.recentRequests.length === 0) && (
                            <div className="text-center py-8 text-gray-500">
                                <AlertCircle className="mx-auto mb-2 text-gray-400" size={24} />
                                <p className="text-sm">No recent requests</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions - Simple Links */}
            <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/admin/departments"
                        className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded group-hover:bg-blue-100 transition-colors">
                                <Building2 className="text-gray-600 group-hover:text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Manage Departments</p>
                                <p className="text-sm text-gray-500">Add, edit, or disable</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-blue-600" size={20} />
                    </Link>

                    <Link
                        to="/admin/services"
                        className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded group-hover:bg-blue-100 transition-colors">
                                <Settings className="text-gray-600 group-hover:text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Manage Services</p>
                                <p className="text-sm text-gray-500">Configure services</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-blue-600" size={20} />
                    </Link>

                    <Link
                        to="/admin/users"
                        className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded group-hover:bg-blue-100 transition-colors">
                                <Users className="text-gray-600 group-hover:text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Manage Users</p>
                                <p className="text-sm text-gray-500">Officers and citizens</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-blue-600" size={20} />
                    </Link>
                </div>
            </div>
        </Layout>
    );
}