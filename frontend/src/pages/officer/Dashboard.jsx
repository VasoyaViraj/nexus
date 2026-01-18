import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { officerAPI } from '../../lib/api';
import Layout from '../../components/layout/Layout';
import { FileText, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, reqRes] = await Promise.all([
        officerAPI.getStats(),
        officerAPI.getRequests({ limit: 10 })
      ]);
      setStats(statsRes.data.data);
      setRequests(reqRes.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING:  'bg-amber-50 text-amber-800 border border-amber-200',
      ACCEPTED: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      REJECTED: 'bg-rose-50 text-rose-800 border border-rose-200',
    };
    const icons = { PENDING: Clock, ACCEPTED: CheckCircle2, REJECTED: XCircle };
    const Icon = icons[status] || Clock;

    return (
      <span
        className={[
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold",
          styles[status] || "bg-slate-50 text-slate-700 border border-slate-200",
        ].join(" ")}
      >
        <Icon size={14} />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="h-10 w-10 rounded-full border-4 border-slate-300 border-t-slate-600 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page Header (no gradient) */}
      <div className="mb-6">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h1 className="text-2xl font-semibold text-slate-900">Department Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              Welcome, <span className="font-medium text-slate-900">{user?.name}</span>
              {" "}•{" "}
              {user?.departmentId?.name || 'Department Officer'}
            </p>
          </div>

          {/* small official accent bar */}
          <div className="h-1 bg-slate-800 rounded-b-lg" />
        </div>
      </div>

      {/* Stats (simple cards with border accents) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center">
              <FileText size={20} className="text-slate-700" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Requests</p>
              <p className="text-2xl font-semibold text-slate-900">{stats?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Clock size={20} className="text-amber-800" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Pending</p>
              <p className="text-2xl font-semibold text-slate-900">{stats?.pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-emerald-800" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Accepted</p>
              <p className="text-2xl font-semibold text-slate-900">{stats?.accepted || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center">
              <XCircle size={20} className="text-rose-800" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Rejected</p>
              <p className="text-2xl font-semibold text-slate-900">{stats?.rejected || 0}</p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Recent Requests (more “official list/table” feel) */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <FileText size={18} className="text-slate-700" />
            Recent Requests
          </h2>
          <Link
            to="/officer/requests"
            className="text-sm font-medium text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="divide-y divide-slate-200">
          {requests.slice(0, 5).map((req) => (
            <Link
              key={req._id}
              to={`/officer/requests/${req._id}`}
              className="block px-6 py-4 hover:bg-slate-50"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-md bg-white border border-slate-200 flex items-center justify-center">
                  <FileText size={18} className="text-slate-700" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-slate-900 truncate">
                      {req.serviceId?.name}
                    </p>
                    <div className="flex-shrink-0">
                      {getStatusBadge(req.status)}
                    </div>
                  </div>

                  <p className="mt-1 text-sm text-slate-600 truncate">
                    {req.citizenId?.name} • {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}

          {requests.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center">
                <FileText className="text-slate-400" size={22} />
              </div>
              <p className="mt-3 text-sm text-slate-600">No requests available</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}