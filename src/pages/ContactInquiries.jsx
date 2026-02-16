import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../config/api';

const ContactInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: '', role: '' });
    const [selectedInquiry, setSelectedInquiry] = useState(null);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter.status) params.status = filter.status;
            if (filter.role) params.role = filter.role;
            const response = await api.get('/contact/admin/all', { params });
            if (response.data.success) {
                setInquiries(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching contact inquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, [filter]);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/contact/${id}/status`, { status });
            fetchInquiries();
            if (selectedInquiry?._id === id) {
                setSelectedInquiry(prev => ({ ...prev, status }));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const deleteInquiry = async (id) => {
        if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
        try {
            await api.delete(`/contact/${id}`);
            fetchInquiries();
            if (selectedInquiry?._id === id) setSelectedInquiry(null);
        } catch (error) {
            console.error('Error deleting inquiry:', error);
        }
    };

    const statusColors = {
        new: 'bg-blue-100 text-blue-700',
        read: 'bg-yellow-100 text-yellow-700',
        resolved: 'bg-green-100 text-green-700',
    };

    const roleLabels = {
        user: 'User',
        partner: 'Partner (Driver)',
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Layout>
            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Contact Inquiries</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage contact form submissions from website visitors</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={filter.status}
                            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2BB673] outline-none bg-white"
                        >
                            <option value="">All Status</option>
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="resolved">Resolved</option>
                        </select>
                        <select
                            value={filter.role}
                            onChange={(e) => setFilter(prev => ({ ...prev, role: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2BB673] outline-none bg-white"
                        >
                            <option value="">All Roles</option>
                            <option value="user">User</option>
                            <option value="partner">Partner</option>
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{inquiries.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                        <p className="text-sm text-blue-600">New</p>
                        <p className="text-2xl font-bold text-blue-700">{inquiries.filter(i => i.status === 'new').length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-yellow-100 shadow-sm">
                        <p className="text-sm text-yellow-600">Read</p>
                        <p className="text-2xl font-bold text-yellow-700">{inquiries.filter(i => i.status === 'read').length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
                        <p className="text-sm text-green-600">Resolved</p>
                        <p className="text-2xl font-bold text-green-700">{inquiries.filter(i => i.status === 'resolved').length}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2BB673]"></div>
                        </div>
                    ) : inquiries.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <span className="material-icons-outlined text-5xl mb-3 block">inbox</span>
                            <p className="text-lg font-medium">No inquiries found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Phone</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">City</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Role</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inquiries.map((inquiry) => (
                                        <tr
                                            key={inquiry._id}
                                            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${inquiry.status === 'new' ? 'bg-blue-50/30' : ''}`}
                                            onClick={() => {
                                                setSelectedInquiry(inquiry);
                                                if (inquiry.status === 'new') updateStatus(inquiry._id, 'read');
                                            }}
                                        >
                                            <td className="py-3 px-4 font-medium text-gray-900">
                                                {inquiry.firstName} {inquiry.lastName}
                                                {inquiry.status === 'new' && <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{inquiry.email}</td>
                                            <td className="py-3 px-4 text-gray-600">{inquiry.phone}</td>
                                            <td className="py-3 px-4 text-gray-600">{inquiry.city}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${inquiry.role === 'partner' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>
                                                    {roleLabels[inquiry.role] || inquiry.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[inquiry.status]}`}>
                                                    {inquiry.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(inquiry.createdAt)}</td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteInquiry(inquiry._id); }}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <span className="material-icons-outlined text-lg">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                {selectedInquiry && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedInquiry(null)}>
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="bg-gradient-to-r from-[#2BB673] to-[#239960] p-6 text-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold">{selectedInquiry.firstName} {selectedInquiry.lastName}</h3>
                                        <p className="text-white/80 text-sm mt-1">{roleLabels[selectedInquiry.role] || selectedInquiry.role}</p>
                                    </div>
                                    <button onClick={() => setSelectedInquiry(null)} className="text-white/70 hover:text-white">
                                        <span className="material-icons-outlined">close</span>
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedInquiry.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedInquiry.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">City</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedInquiry.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(selectedInquiry.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[selectedInquiry.status]}`}>
                                            {selectedInquiry.status}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Message</p>
                                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
                                        {selectedInquiry.message}
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    {selectedInquiry.status !== 'resolved' && (
                                        <button
                                            onClick={() => updateStatus(selectedInquiry._id, 'resolved')}
                                            className="flex-1 bg-[#2BB673] text-white py-2.5 rounded-lg font-medium hover:bg-[#239960] transition-colors text-sm"
                                        >
                                            Mark as Resolved
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { deleteInquiry(selectedInquiry._id); }}
                                        className="px-4 py-2.5 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ContactInquiries;
