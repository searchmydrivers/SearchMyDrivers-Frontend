import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../config/api';

const ContactPage = () => {
    const [content, setContent] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        city: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await api.get('/content/contact-page?appType=user');
                if (response.data.success && response.data.data) {
                    try {
                        const parsed = JSON.parse(response.data.data.content.content);
                        setContent(parsed);
                    } catch (e) { console.error(e); }
                }
            } catch (error) { console.error("Error fetching content", error); }
        };
        fetchContent();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitResult(null);
        try {
            const response = await api.post('/contact', formData);
            if (response.data.success) {
                setSubmitResult({ type: 'success', message: response.data.message });
                setFormData({ firstName: '', lastName: '', email: '', phone: '', role: '', city: '', message: '' });
            }
        } catch (error) {
            setSubmitResult({
                type: 'error',
                message: error.response?.data?.message || 'Something went wrong. Please try again.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const defaultData = {
        hero: {
            title: 'Contact Us',
            subtitle: "We're here to help! Reach out to us for any questions or support."
        },
        info: {
            introTitle: 'Get in Touch',
            introText: "Whether you're looking for a driver, interested in partnering with us, or have general inquiries, our team is ready to assist you.",
            visit: { title: 'Visit Us', text: '123 Driver Lane, Transport City, India' },
            email: { title: 'Email Us', text: 'support@searchmydriver.com' },
            call: { title: 'Call Us', text: '+91 123 456 7890' }
        }
    };

    const data = content || defaultData;
    const { hero, info } = data;

    return (
        <div className="font-sans text-gray-900 overflow-x-hidden w-full">
            <Navbar />

            {/* Header / Hero Section */}
            <section className="relative pt-40 pb-20 bg-gradient-to-br from-[#2BB673] to-[#239960] text-white">
                <div className="container mx-auto px-4 md:px-12 text-center max-w-[1440px]">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fade-in-up">{hero.title}</h1>
                    <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {hero.subtitle}
                    </p>
                </div>
            </section>

            {/* Contact Form & Info Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-12 max-w-[1440px]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                        {/* Contact Information */}
                        <div className="space-y-8 animate-fade-in-up">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">{info.introTitle}</h2>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {info.introText}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-[#2BB673] flex-shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{info.visit.title}</h3>
                                        <p className="text-gray-600">{info.visit.text}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-[#2BB673] flex-shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{info.email.title}</h3>
                                        <p className="text-gray-600">{info.email.text}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-[#2BB673] flex-shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{info.call.title}</h3>
                                        <p className="text-gray-600">{info.call.text}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            {submitResult && (
                                <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${submitResult.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {submitResult.message}
                                </div>
                            )}
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2BB673] focus:border-transparent outline-none transition-all" placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2BB673] focus:border-transparent outline-none transition-all" placeholder="Doe" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2BB673] focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2BB673] focus:border-transparent outline-none transition-all" placeholder="+91 12345 67890" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
                                        <select name="role" value={formData.role} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2BB673] focus:border-transparent outline-none transition-all bg-white text-gray-700 cursor-pointer">
                                            <option value="" disabled>Select your role</option>
                                            <option value="user">User</option>
                                            <option value="partner">Partner (Driver)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2BB673] focus:border-transparent outline-none transition-all" placeholder="Enter your city" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea name="message" value={formData.message} onChange={handleChange} required rows="4" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2BB673] focus:border-transparent outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-[#2BB673] text-white font-bold py-4 rounded-lg hover:bg-[#239960] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {submitting ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ContactPage;
