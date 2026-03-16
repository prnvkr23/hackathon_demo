import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/Sidebar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { FileText, Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: 'bg-[#FEF3C7] text-[#92400E]',
    'In Progress': 'bg-[#DBEAFE] text-[#1E40AF]',
    Resolved: 'bg-[#DCFCE7] text-[#166534]',
  };
  return (
    <Badge className={`${styles[status] || styles.Pending} px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide`}>
      {status}
    </Badge>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    Low: 'bg-gray-100 text-gray-700',
    Medium: 'bg-blue-100 text-blue-700',
    High: 'bg-[#FEE2E2] text-[#991B1B]',
  };
  return (
    <Badge className={`${styles[priority] || styles.Medium} px-2.5 py-0.5 rounded-full text-xs font-medium`}>
      {priority}
    </Badge>
  );
};

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, complaintsRes] = await Promise.all([
        axios.get(`${API}/analytics`),
        axios.get(`${API}/complaints`),
      ]);
      setAnalytics(analyticsRes.data);
      setComplaints(complaintsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    setUpdatingStatus({ ...updatingStatus, [complaintId]: true });
    try {
      await axios.put(`${API}/complaints/${complaintId}`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus({ ...updatingStatus, [complaintId]: false });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      label: 'Total Complaints',
      value: analytics?.total_complaints || 0,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pending',
      value: analytics?.pending_count || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'In Progress',
      value: analytics?.in_progress_count || 0,
      icon: AlertCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Resolved',
      value: analytics?.resolved_count || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  const categoryData = Object.entries(analytics?.category_breakdown || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const priorityData = Object.entries(analytics?.priority_breakdown || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="admin-dashboard">
        {/* Header */}
        <div>
          <h1 className="font-heading text-4xl font-semibold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all complaints</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 bg-white border border-gray-100/50 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300" data-testid={`admin-stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-heading font-semibold mt-2" data-testid={`admin-stat-value-${stat.label.toLowerCase().replace(' ', '-')}`}>{stat.value}</p>
                </div>
                <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card className="p-8 bg-white border border-gray-100/50 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]" data-testid="category-chart">
            <h2 className="font-heading text-xl font-semibold mb-6">Complaints by Category</h2>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No data available</p>
            )}
          </Card>

          {/* Priority Breakdown */}
          <Card className="p-8 bg-white border border-gray-100/50 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]" data-testid="priority-chart">
            <h2 className="font-heading text-xl font-semibold mb-6">Priority Distribution</h2>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No data available</p>
            )}
          </Card>
        </div>

        {/* Recent Complaints */}
        <Card className="p-8 bg-white border border-gray-100/50 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="font-heading text-2xl font-semibold mb-6">All Complaints</h2>
          {complaints.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No complaints yet</p>
          ) : (
            <div className="overflow-x-auto" data-testid="complaints-table">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Priority</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors" data-testid={`complaint-row-${complaint.id}`}>
                      <td className="py-4 px-4 text-sm" data-testid="complaint-student">{complaint.student_name}</td>
                      <td className="py-4 px-4 text-sm" data-testid="complaint-location">{complaint.location}</td>
                      <td className="py-4 px-4 text-sm" data-testid="complaint-category">{complaint.ai_category || complaint.category}</td>
                      <td className="py-4 px-4">
                        {complaint.priority && <PriorityBadge priority={complaint.priority} />}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={complaint.status} />
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {format(new Date(complaint.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={complaint.status}
                          onChange={(e) => updateComplaintStatus(complaint.id, e.target.value)}
                          disabled={updatingStatus[complaint.id]}
                          className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:border-gold focus:ring-gold/20 focus:outline-none"
                          data-testid={`status-select-${complaint.id}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
