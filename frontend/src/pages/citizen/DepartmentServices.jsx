import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { citizenAPI } from '../../lib/api';
import Layout from '../../components/layout/Layout';
import { 
    ArrowLeft, 
    ArrowRight, 
    FileText, 
    Clock, 
    ChevronRight,
    Search,
    Info,
    CheckCircle
} from 'lucide-react';

export default function DepartmentServices() {
    const { id } = useParams();
    const [department, setDepartment] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const response = await citizenAPI.getDepartmentServices(id);
            setDepartment(response.data.data.department);
            setServices(response.data.data.services || []);
        } catch (error) {
            console.error('Error loading services:', error);
        } finally {
            setLoading(false);
        }
    };

    const serviceConfig = {
        'heart-pulse': { emoji: '🏥', bg: 'bg-rose-50', border: 'border-rose-200' },
        'leaf': { emoji: '🌿', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        'calendar-plus': { emoji: '📅', bg: 'bg-purple-50', border: 'border-purple-200' },
        'message-circle': { emoji: '💬', bg: 'bg-cyan-50', border: 'border-cyan-200' },
        'file-text': { emoji: '📄', bg: 'bg-blue-50', border: 'border-blue-200' },
        'default': { emoji: '📋', bg: 'bg-gray-50', border: 'border-gray-200' }
    };

    const getConfig = (iconName) => serviceConfig[iconName] || serviceConfig.default;

    const departmentIcons = {
        'heart-pulse': '🏥',
        'leaf': '🌿',
        'building': '🏛️',
        'book': '📚',
        'car': '🚗',
        'home': '🏠',
    };

    const getDeptIcon = (iconName) => departmentIcons[iconName] || '🏛️';

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 border-4 border-gray-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-gray-500 text-sm">Loading services...</p>
                </div>
            </Layout>
        );
    }

    if (!department) {
        return (
            <Layout>
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Info className="text-gray-400" size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Department not found</h2>
                    <p className="text-gray-500 mb-6">The department you're looking for doesn't exist or has been removed.</p>
                    <Link 
                        to="/departments" 
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back to Departments
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                <ChevronRight size={14} />
                <Link to="/departments" className="hover:text-blue-600 transition-colors">Departments</Link>
                <ChevronRight size={14} />
                <span className="text-gray-900 font-medium">{department.name}</span>
            </nav>

            {/* Department Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                    <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                        {getDeptIcon(department.icon)}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
                        <p className="text-gray-600 mt-1">
                            {department.description || 'Access various services from this department'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                            <FileText size={16} />
                            <span>{services.length} services</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle size={16} />
                            <span>Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Services Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Available Services</h2>
                    <p className="text-gray-500 text-sm mt-1">Select a service to apply</p>
                </div>
                
                {services.length > 3 && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search services..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64 text-sm"
                        />
                    </div>
                )}
            </div>

            {/* Services Grid */}
            {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredServices.map((service) => {
                        const config = getConfig(service.icon);
                        return (
                            <Link
                                key={service._id}
                                to={`/services/${service._id}`}
                                className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 ${config.bg} ${config.border} border rounded-lg flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform`}>
                                        {config.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {service.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {service.description || 'Click to access this service'}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Service meta info */}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {service.processingTime || '3-5 days'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
                                        Apply
                                        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : services.length > 0 ? (
                // Search returned no results
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Search className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No services found</h3>
                    <p className="text-gray-500 mb-4">No results for "{searchTerm}"</p>
                    <button
                        onClick={() => setSearchTerm('')}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        Clear search
                    </button>
                </div>
            ) : (
                // No services at all
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No services available</h3>
                    <p className="text-gray-500 mb-6">This department has no active services at the moment.</p>
                    <Link
                        to="/departments"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Browse Other Departments
                    </Link>
                </div>
            )}

            {/* Help Section */}
            {/* <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Info className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Need help choosing a service?</h3>
                            <p className="text-sm text-gray-600">
                                Contact the {department.name} help desk for guidance
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            View FAQs
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div> */}
        </Layout>
    );
}