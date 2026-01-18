import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { citizenAPI } from '../../lib/api';
import Layout from '../../components/layout/Layout';
import { 
    ArrowLeft, 
    Send, 
    CheckCircle, 
    FileText, 
    AlertCircle,
    ChevronRight,
    Clock,
    Info,
    Loader2
} from 'lucide-react';

export default function ServiceForm() {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        loadService();
    }, [id]);

    const loadService = async () => {
        try {
            const response = await citizenAPI.getService(id);
            setService(response.data.data);

            const initialData = {};
            response.data.data.formSchema?.forEach(field => {
                initialData[field.name] = '';
            });
            setFormData(initialData);
        } catch (error) {
            console.error('Error loading service:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        service.formSchema?.forEach(field => {
            if (field.required && !formData[field.name]?.trim()) {
                errors[field.name] = `${field.label} is required`;
            }
        });
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setError('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await citizenAPI.submitRequest({
                serviceId: id,
                payload: formData
            });
            setSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderField = (field) => {
        const hasError = fieldErrors[field.name];
        const baseClasses = `w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            hasError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        }`;

        switch (field.type) {
            case 'select':
                return (
                    <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={baseClasses}
                        required={field.required}
                    >
                        <option value="">-- Select {field.label} --</option>
                        {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            case 'textarea':
                return (
                    <textarea
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`${baseClasses} min-h-[120px] resize-y`}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        required={field.required}
                        rows={4}
                    />
                );
            case 'date':
                return (
                    <input
                        type="date"
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={baseClasses}
                        required={field.required}
                        min={new Date().toISOString().split('T')[0]}
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={baseClasses}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        required={field.required}
                        min="0"
                    />
                );
            default:
                return (
                    <input
                        type={field.type || 'text'}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={baseClasses}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        required={field.required}
                    />
                );
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 border-4 border-gray-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-gray-500 text-sm">Loading service...</p>
                </div>
            </Layout>
        );
    }

    if (!service) {
        return (
            <Layout>
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-lg mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-gray-400" size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Service not found</h2>
                    <p className="text-gray-500 mb-6">This service may have been removed or is temporarily unavailable.</p>
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

    if (success) {
        return (
            <Layout>
                <div className="max-w-lg mx-auto">
                    {/* Success Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <CheckCircle className="text-emerald-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted</h2>
                        <p className="text-gray-600 mb-6">
                            Your request for <span className="font-medium">{service.name}</span> has been submitted successfully.
                        </p>
                        
                        {/* What's Next */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-left">
                            <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                <Info size={16} className="text-blue-600" />
                                What happens next?
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                                <li>• Your application will be reviewed within 3-5 business days</li>
                                <li>• You'll receive updates via email and in your dashboard</li>
                                <li>• You may be contacted if additional documents are needed</li>
                            </ul>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/requests"
                                className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                            >
                                Track My Request
                            </Link>
                            <Link
                                to="/departments"
                                className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
                            >
                                Back to Services
                            </Link>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                <ChevronRight size={14} />
                <Link to="/departments" className="hover:text-blue-600 transition-colors">Departments</Link>
                <ChevronRight size={14} />
                <Link to={`/departments/${service.departmentId?._id}`} className="hover:text-blue-600 transition-colors">
                    {service.departmentId?.name}
                </Link>
                <ChevronRight size={14} />
                <span className="text-gray-900 font-medium truncate">{service.name}</span>
            </nav>

            <div className="max-w-3xl mx-auto">
                {/* Service Info Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="text-blue-600" size={24} />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-gray-900">{service.name}</h1>
                            <p className="text-gray-600 mt-1">{service.description}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                                {/* <span className="inline-flex items-center gap-1.5 text-gray-500">
                                    <Clock size={14} />
                                    Processing: {service.processingTime || '3-5 business days'}
                                </span>
                                <span className="text-gray-300">|</span> */}
                                <span className="text-gray-500">
                                    Department: {service.departmentId?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Application Form</h2>
                        <p className="text-sm text-gray-500 mt-1">Fill in all required details to submit your application</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-6">
                            {/* Error Alert */}
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <p className="font-medium text-red-800">Submission Error</p>
                                        <p className="text-sm text-red-700 mt-0.5">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Form Fields */}
                            {service.formSchema?.map((field, index) => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    {renderField(field)}
                                    {fieldErrors[field.name] && (
                                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            {fieldErrors[field.name]}
                                        </p>
                                    )}
                                    {field.helpText && (
                                        <p className="mt-1.5 text-sm text-gray-500">{field.helpText}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Form Actions */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                                <p className="text-sm text-gray-500">
                                    <span className="text-red-500">*</span> Required fields
                                </p>
                                <div className="flex gap-3">
                                    <Link
                                        to={`/departments/${service.departmentId?._id}`}
                                        className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Submit Application
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

            </div>
        </Layout>
    );
}