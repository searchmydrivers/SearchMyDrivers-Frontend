import { useState, useEffect, useRef } from 'react';
import { formatDateTime } from '../utils/dateUtils';
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!ticket) return null;

  const isGuest = ticket.raisedBy === 'guest';
  const requester = isGuest ? ticket.guestInfo : (ticket.raisedBy === 'user' ? ticket.user : ticket.driver);
  const requesterName = requester?.name || 'Unknown User';
  const requesterAvatar = isGuest ? null : (requester?.avatar || requester?.profilePicture);

  return (
    <Layout>
      <div className="flex h-[calc(100vh-100px)] gap-4 animate-fade-in">

        {/* Left Side: Ticket Stats & Requester Info */}
        <div className="w-1/3 space-y-3 flex flex-col">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Ticket Details</h2>
            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Subject</span>
                <p className="text-gray-900 font-medium text-xs sm:text-sm mt-0.5">{ticket.subject}</p>
              </div>
              <div className="flex justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Status</span>
                  <div className="mt-1">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className={`text-xs font-semibold rounded px-2 py-1 border-0 ring-1 ring-inset outline-none ${ticket.status === 'open' ? 'ring-blue-600/20 bg-blue-50 text-blue-700' :
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
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Priority</span>
                  <p className={`mt-1 text-xs font-semibold px-2 py-1 rounded inline-block ${ticket.priority === 'high' ? 'bg-red-50 text-red-700' :
                    ticket.priority === 'medium' ? 'bg-orange-50 text-orange-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                    {ticket.priority.toUpperCase()}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Category</span>
                <p className="text-gray-900 text-xs capitalize mt-0.5">{ticket.category}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Ticket ID</span>
                <p className="font-mono text-xs text-gray-600 mt-0.5">{ticket.ticketId}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex-1">
            <h2 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Requester Info</h2>
            <div className="flex items-center gap-3 mb-3">
              {requesterAvatar ? (
                <img src={requesterAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#0B2C4D]/10 flex items-center justify-center text-[#0B2C4D] font-bold text-lg">
                  {requesterName[0]}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900 text-sm">{requesterName}</p>
                <p className="text-xs text-gray-500 capitalize">{ticket.raisedBy}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="material-icons-outlined text-sm">email</span>
                <span className="truncate">{requester?.email || 'N/A'}</span>
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
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-800">Conversation</h2>
            <span className="text-[10px] text-gray-400">{ticket.messages.length} messages</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-gray-50/30">
            {ticket.messages.map((msg, index) => {
              const isAdmin = msg.sender === 'admin' || msg.sender === 'subadmin';
              return (
                <div key={index} className={`flex gap-2 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${isAdmin ? 'bg-[#0B2C4D] text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {isAdmin ? <span className="material-icons-outlined text-[10px]">support_agent</span> : <span className="font-bold text-[10px]">{requesterName[0]}</span>}
                  </div>
                  <div className={`max-w-[85%] space-y-1 ${isAdmin ? 'items-end flex flex-col' : ''}`}>
                    <div className={`p-2.5 rounded-xl text-xs ${isAdmin ? 'bg-[#0B2C4D] text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'}`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                    </div>
                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex gap-2 mt-1">
                        {msg.attachments.map((att, i) => (
                          <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition">
                            <img src={att.url} alt="Attachment" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                    <span className="text-[9px] text-gray-400 block px-1">
                      {formatDateTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-100 bg-white">
            {ticket.status === 'closed' ? (
              <div className="text-center p-3 bg-gray-50 rounded-lg text-gray-500 text-xs">
                This ticket is closed. You cannot send new messages.
              </div>
            ) : (
              <form onSubmit={handleSendReply} className="flex flex-col gap-2">
                {replyImage && (
                  <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-lg w-fit border border-gray-200">
                    <span className="material-icons-outlined text-gray-500 text-sm">image</span>
                    <span className="text-xs text-gray-600 truncate max-w-[150px]">{replyImage.name}</span>
                    <button type="button" onClick={() => { setReplyImage(null); fileInputRef.current.value = ''; }} className="text-red-500 hover:text-red-700">
                      <span className="material-icons-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <textarea
                      rows="1"
                      className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0B2C4D] outline-none resize-none text-xs"
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      title="Attach Image"
                    >
                      <span className="material-icons-outlined text-lg">attach_file</span>
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
                    className="bg-[#0B2C4D] text-white px-3 py-2 rounded-lg hover:bg-[#091E3A] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 w-10 h-10 shadow-sm"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <span className="material-icons-outlined text-lg">send</span>
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
