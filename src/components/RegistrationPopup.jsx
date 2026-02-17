import React, { useState, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

const RegistrationPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('user'); // 'user' or 'partner'
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        message: ''
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const hasSeenPopup = sessionStorage.getItem('hasSeenRegistrationPopup_v2');
            if (!hasSeenPopup) {
                setIsVisible(true);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('hasSeenRegistrationPopup_v2', 'true');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Restriction for Phone Number: Only digits, max 10
        if (name === 'phone') {
            if (!/^\d*$/.test(value)) return; // Only allow digits
            if (value.length > 10) return;    // Max 10 digits
        }

        // Restriction for Full Name: Only string (letters and spaces)
        if (name === 'fullName') {
            if (!/^[a-zA-Z\s]*$/.test(value)) return;
        }

        // Restriction for Email: No spaces allowed
        if (name === 'email') {
            if (/\s/.test(value)) return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Split fullName into firstName and lastName for backend compatibility
        const nameParts = formData.fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ' ';

        try {
            const response = await api.post('/contact', {
                firstName,
                lastName,
                email: formData.email,
                phone: formData.phone,
                role: activeTab,
                city: formData.city,
                message: formData.message
            });

            if (response.data.success) {
                toast.success('Your details have been submitted successfully!');
                handleClose();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
            alert(`Failed to submit: ${errorMsg}`);
            console.error('Submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-opacity duration-500" style={{ animation: 'fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-100px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #2BB673;
                    border-radius: 10px;
                }
            `}</style>
            <div className="bg-white rounded-2xl md:rounded-[32px] w-[95%] md:w-full max-w-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20 relative flex flex-col md:flex-row max-h-[85vh] md:max-h-[90vh]" style={{ animation: 'slide-down 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all z-20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Left Side - Visual/Info - Hidden on Mobile */}
                <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-[#2BB673] to-[#239960] p-8 text-white flex-col justify-between relative overflow-hidden h-full">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-extrabold mb-4 leading-tight">
                            Join Our <br />
                            <span className="text-[#dcfce7]">Network</span>
                        </h2>
                        <p className="text-white/80 text-sm leading-relaxed mb-8">
                            Whether you're looking for a driver or want to join as a partner, we've got you covered. Fill in your details and we'll reach out!
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span>Police Verified Drivers</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <span>24/7 Support</span>
                            </div>
                        </div>
                    </div>

                    {/* Abstract background shapes */}
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-3/5 p-5 md:p-10 bg-[#fdfdfd] overflow-y-auto custom-scrollbar h-full">
                    <div className="mb-5 md:mb-6 mt-2 md:mt-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Send us an Inquiry</h3>
                        <p className="text-gray-500 text-xs">Fill the form below and our team will contact you shortly.</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1.5 bg-gray-100/80 rounded-2xl mb-6 md:mb-8">
                        <button
                            onClick={() => setActiveTab('user')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all ${activeTab === 'user' ? 'bg-white text-[#239960] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            User Inquiry
                        </button>
                        <button
                            onClick={() => setActiveTab('partner')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all ${activeTab === 'partner' ? 'bg-[#239960] text-white shadow-md shadow-green-200' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg>
                            Driver Reg.
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                        <div className="relative group">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block ml-1 group-focus-within:text-[#2BB673] transition-colors">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2BB673] transition-colors">
                                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <input
                                    required
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#2BB673]/20 focus:border-[#2BB673] focus:bg-white outline-none transition-all text-sm font-medium"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div className="relative group">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block ml-1 group-focus-within:text-[#2BB673] transition-colors">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2BB673] transition-colors">
                                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </div>
                                    <input
                                        required
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#2BB673]/20 focus:border-[#2BB673] focus:bg-white outline-none transition-all text-sm font-medium"
                                        placeholder="10-digit phone"
                                    />
                                </div>
                            </div>
                            <div className="relative group">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block ml-1 group-focus-within:text-[#2BB673] transition-colors">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2BB673] transition-colors">
                                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#2BB673]/20 focus:border-[#2BB673] focus:bg-white outline-none transition-all text-sm font-medium"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block ml-1 group-focus-within:text-[#2BB673] transition-colors">
                                Location / City
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2BB673] transition-colors">
                                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <input
                                    required
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#2BB673]/20 focus:border-[#2BB673] focus:bg-white outline-none transition-all text-sm font-medium"
                                    placeholder="e.g. Mumbai, Navi Mumbai"
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block ml-1 group-focus-within:text-[#2BB673] transition-colors">
                                Message
                            </label>
                            <div className="relative">
                                <div className="absolute top-3 left-3.5 pointer-events-none text-gray-400 group-focus-within:text-[#2BB673] transition-colors">
                                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                </div>
                                <textarea
                                    required
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#2BB673]/20 focus:border-[#2BB673] focus:bg-white outline-none transition-all text-sm font-medium resize-none"
                                    placeholder={`Tell us more about your ${activeTab === 'user' ? 'requirement' : 'experience'}...`}
                                ></textarea>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#2BB673] to-[#239960] text-white font-bold py-3.5 md:py-4 rounded-xl md:rounded-2xl shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    Submit Details
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPopup;
