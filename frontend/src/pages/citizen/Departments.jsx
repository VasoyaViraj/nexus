import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { citizenAPI } from '../../lib/api';
import Layout from '../../components/layout/Layout';
import { Building2, ArrowRight, Search, Grid3X3, List, ChevronRight } from 'lucide-react';

export default function Departments() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const response = await citizenAPI.getDepartments();
            setDepartments(response.data.data || []);
        } catch (error) {
            console.error('Error loading departments:', error);
        } finally {
            setLoading(false);
        }
    };

    const departmentConfig = {
        'heart-pulse': { emoji: '🏥', bg: 'bg-rose-50', accent: 'border-rose-200', hover: 'hover:border-rose-300' },
        'leaf': { emoji: '🌿', bg: 'bg-emerald-50', accent: 'border-emerald-200', hover: 'hover:border-emerald-300' },
        'building': { emoji: '🏛️', bg: 'bg-blue-50', accent: 'border-blue-200', hover: 'hover:border-blue-300' },
        'book': { emoji: '📚', bg: 'bg-amber-50', accent: 'border-amber-200', hover: 'hover:border-amber-300' },
        'car': { emoji: '🚗', bg: 'bg-slate-50', accent: 'border-slate-200', hover: 'hover:border-slate-300' },
        'home': { emoji: '🏠', bg: 'bg-purple-50', accent: 'border-purple-200', hover: 'hover:border-purple-300' },
        'default': { emoji: '🏛️', bg: 'bg-gray-50', accent: 'border-gray-200', hover: 'hover:border-gray-300' }
    };

    const getConfig = (iconName) => departmentConfig[iconName] || departmentConfig.default;

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 border-4 border-gray-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-gray-500 text-sm">Loading departments...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Clean Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <Link to="/" className="hover:text-blue-600">Home</Link>
                            <ChevronRight size={14} />
                            <span className="text-gray-900">Departments</span>
                        </nav>
                        <h1 className="text-3xl font-bold text-gray-900">Government Departments</h1>
                        <p className="text-gray-600 mt-2">Browse departments and access their services</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">{filteredDepartments.length} departments</span>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search departments..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-md transition-all ${
                                viewMode === 'grid' 
                                    ? 'bg-white shadow-sm text-blue-600' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Grid3X3 size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-md transition-all ${
                                viewMode === 'list' 
                                    ? 'bg-white shadow-sm text-blue-600' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDepartments.map((dept) => {
                        const config = getConfig(dept.icon);
                        return (
                            <Link
                                key={dept._id}
                                to={`/departments/${dept._id}`}
                                className={`group bg-white rounded-xl p-6 border-2 ${config.accent} ${config.hover} shadow-sm hover:shadow-md transition-all`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 ${config.bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform`}>
                                        {config.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                            {dept.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2">
                                            {dept.description || 'Access services from this department'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-600">View services</span>
                                    <ArrowRight className="text-blue-600 group-hover:translate-x-1 transition-transform" size={16} />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="divide-y divide-gray-100">
                        {filteredDepartments.map((dept) => {
                            const config = getConfig(dept.icon);
                            return (
                                <Link
                                    key={dept._id}
                                    to={`/departments/${dept._id}`}
                                    className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className={`w-12 h-12 ${config.bg} rounded-lg flex items-center justify-center text-xl flex-shrink-0`}>
                                        {config.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {dept.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 truncate">
                                            {dept.description || 'Access services from this department'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-sm text-gray-400 hidden sm:block">View services</span>
                                        <div className="w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                                            <ArrowRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={16} />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filteredDepartments.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Building2 className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No departments found</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        {searchTerm 
                            ? `No results for "${searchTerm}". Try a different search term.`
                            : 'No departments are currently available.'}
                    </p>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            )}

            {/* Help Banner */}
            {/* <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">💡</span>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Can't find what you're looking for?</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Contact our help desk for assistance with government services
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/help"
                        className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors whitespace-nowrap"
                    >
                        Get Help
                    </Link>
                </div>
            </div> */}
        </Layout>
    );
}