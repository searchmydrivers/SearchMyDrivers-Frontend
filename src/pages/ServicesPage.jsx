import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const ServicesPage = () => {
    const [content, setContent] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await axios.get(`${API_URL}/content/services-page?appType=user`);
                if (response.data.success && response.data.data) {
                    try {
                        const parsed = JSON.parse(response.data.data.content.content);
                        setContent(parsed);
                    } catch (e) {
                        console.error("JSON parse error", e);
                    }
                }
            } catch (error) {
                console.error("Error fetching content", error);
            }
        };
        fetchContent();
    }, []);

    // Default/Fallback Data
    const defaultData = {
        hero: {
            subBadge: 'Our Services',
            title: 'Professional Driving Solutions For Every Need',
            description: "Experience safe, reliable, and comfortable journeys with our verified drivers. Whether it's a quick errand or a long-distance trip, we've got you covered.",
            features: ['Verified Drivers', '24/7 Available', 'Affordable Rates', 'Safe Journey']
        },
        services: [
            {
                title: 'Hourly Driver',
                description: 'Perfect for short errands, shopping, meetings, or quick city rides.',
                icon: 'clock'
            },
            {
                title: 'Outstation Trip',
                description: 'Plan your weekend getaways or long vacations with our experienced drivers.',
                icon: 'map'
            },
            {
                title: 'Daily Commute',
                description: 'Hassle-free daily rides to your office. Monthly packages available.',
                icon: 'briefcase'
            },
            {
                title: 'Airport Transfer',
                description: 'On-time pickups and drops for your flights. Never miss a flight again.',
                icon: 'plane'
            },
            {
                title: 'Night Drop',
                description: 'Safe and secure drops after late-night parties or events.',
                icon: 'moon'
            },
            {
                title: 'Valet Parking',
                description: 'Professional valet services for your events and parties.',
                icon: 'car'
            }
        ]
    };

    const data = content || defaultData;
    const { hero, services } = data;

    // Helper to render icon (simplified for dynamic strings, fallback to SVG if matches default name)
    const renderIcon = (iconName) => {
        // Mapping common names to SVGs or returning a generic one
        switch (iconName) {
            case 'clock': return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            case 'map': return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
            case 'briefcase': return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
            case 'plane': return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>; // Generic plane approximation
            case 'moon': return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
            case 'car': return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-2 7 2m-14 0l-2 5h18l-2-5m-14 0h14" /></svg>; // Generic car approximation
            default: return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>; // Default zap
        }
    };

    return (
        <div className="font-sans antialiased text-gray-900 bg-white">
            <Helmet>
                <title>Professional Driver Services | SearchMyDrivers</title>
                <meta name="description" content="Explore our wide range of driver services including hourly drivers, outstation trips, monthly commutes, and airport transfers. Verified and professional drivers at your service." />
                <meta name="keywords" content="hourly driver Mumbai, outstation driver, office commute driver, airport pickup driver, valet parking service" />
                <link rel="canonical" href="https://searchmydrivers.com/services" />
            </Helmet>
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
                <div className="container mx-auto px-4 md:px-12 max-w-[1440px] py-16 lg:py-20 pt-28">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        {/* Left Side - Text Content */}
                        <div className="animate-fade-in-up space-y-4">
                            <div className="inline-block">
                                <span className="text-[#2BB673] font-semibold text-xs uppercase tracking-wider bg-[#2BB673]/10 px-3 py-1.5 rounded-full">
                                    {hero?.subBadge || 'Our Services'}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                                {hero?.title ? (
                                    <>
                                        {hero.title.split(' ').slice(0, 1).join(' ')} <span className="text-[#2BB673]">{hero.title.split(' ').slice(1).join(' ')}</span>
                                    </>
                                ) : (
                                    <>Professional <span className="text-[#2BB673]">Driving Solutions</span> For Every Need</>
                                )}
                            </h1>
                            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                                {hero?.description}
                            </p>

                            {/* Quick Features */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                {hero?.features?.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-[#2BB673]/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-[#2BB673]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-300 text-sm font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side - Video */}
                        <div className="relative animate-fade-in-up max-w-md mx-auto lg:mx-0" style={{ animationDelay: '0.2s' }}>
                            <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-[#2BB673]/20">
                                <div className="aspect-[3/4]">
                                    <video
                                        src="/WhatsApp Video 2026-02-14 at 3.24.26 PM (1).mp4"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            {/* Decorative Elements */}
                            <div className="absolute -top-3 -right-3 w-16 h-16 bg-[#2BB673]/20 rounded-full blur-xl"></div>
                            <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Services Grid */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-4 md:px-12 max-w-[1440px]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {services?.map((service, index) => (
                            <div key={index} className="bg-white rounded-xl p-8 border-t-4 border-l-4 border-blue-500 shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                        {renderIcon(service.icon)}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                                <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ServicesPage;
