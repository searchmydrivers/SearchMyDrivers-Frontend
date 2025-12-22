import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import api from '../config/api';
import toast from 'react-hot-toast';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyImage, setReplyImage] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      if (res.data.success) {
        setTicket(res.data.data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast.error('Failed to load ticket details');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.put(`/tickets/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setTicket(prev => ({ ...prev, status: newStatus }));
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setReplyImage(e.target.files[0]);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() && !replyImage) return;

    setSending(true);
    const formData = new FormData();
    formData.append('message', replyMessage);
    if (replyImage) {
      formData.append('image', replyImage);
    }

    try {
      const res = await api.post(`/tickets/${id}/reply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setTicket(res.data.data);
        setReplyMessage('');
        setReplyImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        scrollToBottom();
        toast.success('Reply sent successfully');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!ticket) return null;

  const requester = ticket.raisedBy === 'user' ? ticket.user : ticket.driver;
  const requesterName = requester?.name || 'Unknown User';
  const requesterAvatar = requester?.avatar || requester?.profilePicture; // Handle both user (avatar) and driver (profilePicture) fields if different.

  return (
    <Layout>
      <div className="flex h-[calc(100vh-120px)] gap-6">

        {/* Left Side: Ticket Stats & Requester Info */}
        <div className="w-1/3 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Ticket Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Subject</span>
                <p className="text-gray-900 font-medium">{ticket.subject}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                  <div className="mt-1">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className={`text-sm font-semibold rounded-lg px-2 py-1 border-0 ring-1 ring-inset ${ticket.status === 'open' ? 'ring-[#0B2C4D]/20 bg-blue-50 text-[#0B2C4D]' :
                        ticket.status === 'in-progress' ? 'ring-yellow-600/20 bg-yellow-50 text-yellow-700' :
                          ticket.status === 'resolved' ? 'ring-green-600/20 bg-green-50 text-green-700' :
                            'ring-gray-600/20 bg-gray-50 text-gray-700'
                        }`}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Priority</span>
                  <p className={`mt-1 text-sm font-semibold px-2 py-1 rounded-lg ${ticket.priority === 'high' ? 'bg-red-50 text-red-700' :
                    ticket.priority === 'medium' ? 'bg-orange-50 text-orange-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                    {ticket.priority.toUpperCase()}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Category</span>
                <p className="text-gray-900 text-sm capitalize">{ticket.category}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Ticket ID</span>
                <p className="font-mono text-sm text-gray-600">{ticket.ticketId}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Requester Info</h2>
            <div className="flex items-center gap-3 mb-4">
              {requesterAvatar ? (
                <img src={requesterAvatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#0B2C4D]/10 flex items-center justify-center text-[#0B2C4D] font-bold text-xl">
                  {requesterName[0]}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900">{requesterName}</p>
                <p className="text-sm text-gray-500 capitalize">{ticket.raisedBy}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="material-icons-outlined text-sm">email</span>
                {requester?.email || 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="material-icons-outlined text-sm">phone</span>
                {requester?.phone || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Conversation */}
        <div className="w-2/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800">Conversation</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/20">
            {ticket.messages.map((msg, index) => {
              const isAdmin = msg.sender === 'admin' || msg.sender === 'subadmin';
              return (
                <div key={index} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-[#0B2C4D] text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {isAdmin ? <span className="material-icons-outlined text-sm">support_agent</span> : <span className="font-bold text-xs">{requesterName[0]}</span>}
                  </div>
                  <div className={`max-w-[80%] space-y-1 ${isAdmin ? 'items-end flex flex-col' : ''}`}>
                    <div className={`p-3 rounded-2xl text-sm ${isAdmin ? 'bg-[#0B2C4D] text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'}`}>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {msg.attachments.map((att, i) => (
                          <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="block w-32 h-32 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition">
                            <img src={att.url} alt="Attachment" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] text-gray-400 block px-1">
                      {new Date(msg.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            {ticket.status === 'closed' ? (
              <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-500 text-sm">
                This ticket is closed. You cannot send new messages.
              </div>
            ) : (
              <form onSubmit={handleSendReply} className="flex flex-col gap-3">
                {replyImage && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg w-fit">
                    <span className="material-icons-outlined text-gray-500">image</span>
                    <span className="text-sm text-gray-600 truncate max-w-xs">{replyImage.name}</span>
                    <button type="button" onClick={() => { setReplyImage(null); fileInputRef.current.value = ''; }} className="text-red-500 hover:text-red-700">
                      <span className="material-icons-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <textarea
                      rows="1"
                      className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B2C4D] outline-none resize-none"
                      placeholder="Type your reply here..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply(e);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      title="Attach Image"
                    >
                      <span className="material-icons-outlined">attach_file</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending || (!replyMessage.trim() && !replyImage)}
                    className="bg-[#0B2C4D] text-white px-4 py-2 rounded-xl hover:bg-[#091E3A] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 w-12 h-12"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <span className="material-icons-outlined">send</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TicketDetails;
