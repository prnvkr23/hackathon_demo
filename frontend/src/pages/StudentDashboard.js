import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { FileText, Clock, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categories = ['Electrical', 'Cleaning', 'Internet', 'Maintenance', 'Other'];

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: 'bg-[#FEF3C7] text-[#92400E]',
    'In Progress': 'bg-[#DBEAFE] text-[#1E40AF]',
    Resolved: 'bg-[#DCFCE7] text-[#166534]',
  };
  return (
    <Badge className={`${styles[status] || styles.Pending} px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide`} data-testid={`status-badge-${status.toLowerCase().replace(' ', '-')}`}>
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
    <Badge className={`${styles[priority] || styles.Medium} px-2.5 py-0.5 rounded-full text-xs font-medium`} data-testid={`priority-badge-${priority.toLowerCase()}`}>
      {priority}
    </Badge>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    student_name: user?.name || '',
    category: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get(`${API}/complaints`);
      setComplaints(response.data);
    } catch (error) {
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/complaints`, formData);
      toast.success('Complaint submitted successfully! AI is analyzing...');
      setFormData({
        student_name: user?.name || '',
        category: '',
        location: '',
        description: '',
      });
      setShowForm(false);
      fetchComplaints();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    {
      label: 'Total Complaints',
      value: complaints.length,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pending',
      value: complaints.filter(c => c.status === 'Pending').length,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'In Progress',
      value: complaints.filter(c => c.status === 'In Progress').length,
      icon: AlertCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Resolved',
      value: complaints.filter(c => c.status === 'Resolved').length,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="student-dashboard">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gold hover:bg-gold-hover text-white font-medium px-6 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            data-testid="new-complaint-button"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            New Complaint
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 bg-white border border-gray-100/50 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300" data-testid={`stat-card-${stat.label.toLowerCase().replace(' ', '-')}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-heading font-semibold mt-2" data-testid={`stat-value-${stat.label.toLowerCase().replace(' ', '-')}`}>{stat.value}</p>
                </div>
                <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Complaint Form */}
        {showForm && (
          <Card className="p-8 bg-white border border-gray-100/50 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]" data-testid="complaint-form-card">
            <h2 className="font-heading text-2xl font-semibold mb-6">Submit New Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="complaint-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="student_name">Student Name</Label>
                  <Input
                    id="student_name"
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    required
                    data-testid="student-name-input"
                    className="rounded-md border-gray-200 focus:border-gold focus:ring-gold/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category (Optional - AI will detect)</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-gold focus:ring-gold/20 focus:outline-none transition-all duration-200"
                    data-testid="category-select"
                  >
                    <option value="">Let AI detect</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (Building / Room / Area)</Label>
                <Input
                  id="location"
                  placeholder="e.g., Main Building, Room 204"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  data-testid="location-input"
                  className="rounded-md border-gray-200 focus:border-gold focus:ring-gold/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  data-testid="description-input"
                  className="rounded-md border-gray-200 focus:border-gold focus:ring-gold/20"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gold hover:bg-gold-hover text-white font-medium px-6 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                  data-testid="submit-complaint-button"
                >
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg"
                  data-testid="cancel-button"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Recent Complaints */}
        <Card className="p-8 bg-white border border-gray-100/50 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="font-heading text-2xl font-semibold mb-6">My Complaints</h2>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12" data-testid="no-complaints-message">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No complaints yet. Click "New Complaint" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4" data-testid="complaints-list">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="p-6 border border-gray-100 rounded-lg hover:border-gold/30 hover:shadow-md transition-all duration-200"
                  data-testid={`complaint-item-${complaint.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg" data-testid="complaint-location">{complaint.location}</h3>
                        <StatusBadge status={complaint.status} />
                        {complaint.priority && <PriorityBadge priority={complaint.priority} />}
                      </div>
                      <p className="text-sm text-gray-500">
                        {format(new Date(complaint.created_at), 'MMM dd, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3" data-testid="complaint-description">{complaint.description}</p>
                  {complaint.summary && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-blue-900 font-medium">AI Summary:</p>
                      <p className="text-sm text-blue-800" data-testid="ai-summary">{complaint.summary}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      Category: <span className="font-medium text-gray-900" data-testid="complaint-category">{complaint.ai_category || complaint.category}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
