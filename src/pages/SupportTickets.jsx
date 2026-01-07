import { useState, useEffect } from 'react';
import { formatDate } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import api from '../config/api';
import toast from 'react-hot-toast';

const SupportTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters);
      // Clean up empty filters
      for (const [key, value] of queryParams.entries()) {
        if (!value) queryParams.delete(key);
      }

      const res = await api.get(`/tickets/admin/all?${queryParams.toString()}`);
      if (res.data.success) {
        setTickets(res.data.data.tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters.status, filters.priority]); // Re-fetch when specific filters change

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const statusColors = {
    open: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-orange-100 text-orange-600',
    high: 'bg-red-100 text-red-600',
  };

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="material-icons-outlined text-blue-600">support_agent</span>
            Support Tickets
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="material-icons-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">search</span>
            <input
              type="text"
              name="search"
              placeholder="Search by Ticket ID or Subject..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-xs sm:text-sm"
            />
          </div>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white text-xs sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white text-xs sm:text-sm"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#0B2C4D]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Ticket ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Raised By</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500 text-sm">
                      No tickets found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        {ticket.ticketId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs sm:text-sm text-gray-900 truncate max-w-xs" title={ticket.subject}>{ticket.subject}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {ticket.raisedBy === 'user' && (ticket.user ? (
                            <>
                              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px] mr-2">
                                {ticket.user.name?.[0] || 'U'}
                              </div>
                              <div className="text-xs">
                                <div className="font-medium text-gray-900">{ticket.user.name}</div>
                                <div className="text-[10px] text-gray-500">User</div>
                              </div>
                            </>
                          ) : <span className="text-gray-400 italic text-xs">Deleted User</span>)}

                          {ticket.raisedBy === 'driver' && (ticket.driver ? (
                            <>
                              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-[10px] mr-2">
                                {ticket.driver.name?.[0] || 'D'}
                              </div>
                              <div className="text-xs">
                                <div className="font-medium text-gray-900">{ticket.driver.name}</div>
                                <div className="text-[10px] text-gray-500">Driver</div>
                              </div>
                            </>
                          ) : <span className="text-gray-400 italic text-xs">Deleted Driver</span>)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 inline-flex text-[10px] leading-4 font-semibold rounded-full uppercase tracking-wide ${statusColors[ticket.status]}`}>
                          {ticket.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 inline-flex text-[10px] leading-4 font-semibold rounded-full uppercase tracking-wide ${priorityColors[ticket.priority]}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium">
                        <button
                          onClick={() => navigate(`/tickets/${ticket._id}`)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition-colors"
                        >
                          View & Reply
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SupportTickets;
