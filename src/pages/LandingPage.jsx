
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


// Landing Page Component
const LandingPage = () => {
    const [activeDriverIndex, setActiveDriverIndex] = useState(0);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [landingPageData, setLandingPageData] = useState(null);
    const [loading, setLoading] = useState(true);

    // const API_URL = import.meta.env.VITE_API_URL || 'https://api.searchmydrivers.com/api';

    // Fetch landing page data
    useEffect(() => {
        const fetchLandingPageData = async () => {
            try {
                const response = await api.get(`/landing-page`);
                if (response.data.success) {
                    setLandingPageData(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching landing page data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLandingPageData();
    }, []);

    const driverImages = landingPageData?.driverAppSection?.appImages?.length > 0
        ? landingPageData.driverAppSection.appImages
        : [
            "/215cdc65-40d2-46d4-a0d6-0cfb1709a687-removebg-preview (1).png",
            "/7191f9b3-5267-4898-84f3-bb0f993c6d93-removebg-preview.png",
            "/d6d0acd7-6fbe-481f-8932-9761ca12cff1-removebg-preview.png",
            "/dd4559c9-f112-47f8-a7c7-c4bddcdc73ec-removebg-preview.png"
        ];

    const userImages = landingPageData?.userAppSection?.appImages?.length > 0
        ? landingPageData.userAppSection.appImages
        : ["/user1.png", "/user2.png", "/user3.png"];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveDriverIndex((prev) => (prev + 1) % driverImages.length);
        }, 3000); // 3 seconds per image
        return () => clearInterval(interval);
    }, [driverImages.length]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2BB673]"></div>
            </div>
        );
    }

    // Default Fallback Data (to preserve UI if DB is empty)
    const stats = landingPageData?.statsSection?.stats?.length > 0 ? landingPageData.statsSection.stats : [
        { number: '20000+', label: 'POLICE VERIFIED DRIVERS', icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z' },
        { number: '5 LAC+', label: 'HAPPY CLIENTS', icon: 'users' }, // Special handling for users icon in UI
        { number: '1 LAC+', label: 'Permanent Drivers', icon: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11' }
    ];

    const features = landingPageData?.whyChooseUs?.features?.length > 0 ? landingPageData.whyChooseUs.features : [
        { title: 'Verified Drivers', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', description: 'Every driver undergoes a rigorous background check and verification process.' },
        { title: 'Real-time Tracking', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', description: 'Track your ride in real-time and share your status with loved ones for added safety.' },
        { title: 'Affordable Rates', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', description: 'Transparent pricing with no hidden charges. Premium service at competitive rates.' }
    ];

    const cities = landingPageData?.citiesSection?.cities?.length > 0
        ? landingPageData.citiesSection.cities.map(c => {
            if (typeof c === 'string') return c;
            if (c && typeof c === 'object') {
                if (c.name) return c.name;
                const keys = Object.keys(c).filter(k => !isNaN(k)).sort((a, b) => Number(a) - Number(b));
                if (keys.length > 0) return keys.map(k => c[k]).join('');
            }
            return '';
        }).filter(Boolean)
        : ['Mumbai', 'Navi Mumbai', 'Thane', 'Pune'];

    const testimonials = landingPageData?.testimonialsSection?.testimonials?.length > 0 ? landingPageData.testimonialsSection.testimonials : [
        { name: 'Sarah Johnson', role: 'Daily Commuter', content: "The drivers are incredibly professional and punctual. It's completely changed my morning commute for the better!" },
        { name: 'Michael Chen', role: 'Business Traveler', content: "Reliability is key for my business trips. SearchMyDriver has never let me down. Highly recommended!" },
        { name: 'Emily Davis', role: 'Weekend Explorer', content: "I love the peace of mind knowing I have a safe driver for my weekend getaways. The booking process is so easy." },
        { name: 'David Lee', role: 'Frequent Flyer', content: "Airport transfers have never been smoother. Always on time and very courteous drivers." },
        { name: 'Jessica Brown', role: 'Mom of Two', content: "I trust SearchMyDriver for my kids' school runs when I'm stuck at work. Safe and trackable!" }
    ];

    const faqs = landingPageData?.faqSection?.faqs?.length > 0 ? landingPageData.faqSection.faqs : [
        { question: "How do I book a driver?", answer: "You can book a driver easily through our website or mobile app. Just enter your location, destination, and preferred time." },
        { question: "Are your drivers verified?", answer: "Yes, all our drivers undergo rigorous background checks and police verification to ensure your safety." },
        { question: "What are the payment options?", answer: "We accept various payment methods including credit/debit cards, UPI, and cash." },
        { question: "Can I book a driver for outstation trips?", answer: "Absolutely! We provide drivers for both local and outstation trips. You can choose from our flexible packages." },
        { question: "What if I need to cancel my booking?", answer: "You can cancel your booking through the app. Please refer to our cancellation policy for more details." }
    ];

    return (
        <div className="font-sans antialiased text-gray-900 bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-[110vh] flex items-start pt-48 pb-32 overflow-hidden bg-gradient-to-br from-[#2BB673] to-[#239960]">
                {/* Background Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}></div>

                <div className="container mx-auto px-4 md:px-12 relative z-10 max-w-[1440px]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Left Column: Content + Video */}
                        <div className="space-y-8 lg:order-2">
                            <div className="space-y-6">
                                <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
                                    <span className="block animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                                        {landingPageData?.hero?.title?.split(' ').slice(0, 2).join(' ') || 'Your Trusted'}
                                    </span>
                                    <span className="block text-[#dcfce7] animate-fade-in-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                                        {landingPageData?.hero?.title?.split(' ').slice(2).join(' ') || 'Driving Partner'}
                                    </span>
                                </h1>
                                <p className="text-xl md:text-2xl text-white/90 max-w-lg leading-relaxed animate-fade-in-up opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                                    {landingPageData?.hero?.subtitle || 'Experience the safest and most reliable driver service. Whether for daily commutes or special occasions, we connect you with professional drivers instantly.'}
                                </p>

                                <div className="flex flex-wrap gap-4">
                                    <Link to="/login" className="bg-white text-[#239960] px-8 py-3.5 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-2">
                                        {landingPageData?.hero?.ctaText || 'Get Started'}
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </Link>
                                    <a href={landingPageData?.hero?.appStoreLink || '#'} className="bg-black text-white px-6 py-2.5 rounded-full flex items-center gap-3 hover:bg-gray-900 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.64 3.98-1.64 1.25.04 2.37.5 3.08 1.48-2.61 1.58-2.18 4.71.69 5.89-.53 1.55-1.25 3.09-2.83 6.5zm-3.27-14.7c.64-1.02.99-2.28.61-3.58 1.09.28 2.37.91 2.94 1.96.17.65.04 1.59-.44 2.54-.7.83-1.87 1.21-2.91 1.05-.17-.67-.2-1.32-.2-1.97z" />
                                        </svg>
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-[10px] font-medium opacity-80">Download on the</span>
                                            <span className="text-xl font-bold">App Store</span>
                                        </div>
                                    </a>

                                </div>
                            </div>
                        </div>

                        {/* Left Column: Car Image */}
                        <div className="relative flex justify-center lg:justify-start lg:order-1 animate-drive-in-left" style={{ animationDelay: '0.3s' }}>
                            <div className="relative z-10 w-full max-w-[800px]">
                                <img
                                    src={landingPageData?.hero?.image || "/Gemini_Generated_Image_2jf3zt2jf3zt2jf3-removebg-preview.png"}
                                    alt="Premium Car"
                                    className="w-full h-auto drop-shadow-2xl filter brightness-105 contrast-105 transform hover:scale-[1.02] transition-transform duration-500"
                                />
                                {/* Reflection/Shadow */}
                                <div className="absolute -bottom-8 left-10 right-10 h-12 bg-black/20 blur-2xl rounded-[50%] transform scale-x-90"></div>
                            </div>

                            {/* Decorative Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 rounded-full blur-3xl -z-10"></div>
                        </div>

                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto block">
                        <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white relative z-20 -mt-20">
                <div className="container mx-auto px-4 md:px-12 max-w-[1440px]">

                    {/* Collapsible Text Section */}
                    {landingPageData?.statsSection?.description && (
                        <div className="mb-12 text-center max-w-4xl mx-auto">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{landingPageData?.statsSection?.heading || "Hassle-Free Commute with #1 Driver Service"}</h2>
                            <div className={`prose prose-lg mx-auto text-gray-600 transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[1000px]' : 'max-h-24'}`}>
                                <p dangerouslySetInnerHTML={{ __html: landingPageData.statsSection.description.replace(/\n/g, '<br/>') }}></p>
                            </div>
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-4 text-[#2BB673] font-bold hover:underline focus:outline-none"
                            >
                                {isExpanded ? 'Read Less' : 'Read More...'}
                            </button>
                        </div>
                    )}
                    {!landingPageData?.statsSection?.description && (
                        <div className="mb-12 text-center max-w-4xl mx-auto">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Hassle-Free Commute with #1 Driver Service – SearchMyDrivers</h2>
                            <div className={`prose prose-lg mx-auto text-gray-600 transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[1000px]' : 'max-h-24'}`}>
                                <p className="mb-4">
                                    Welcome to SearchMyDrivers – your trusted driver on call service. Say goodbye to the stress of driving, parking, and navigating through traffic. Whether you need a driver for rent near you or a professional chauffeur for daily travel, we’ve got you covered. Our mission is simple: to provide safe, reliable, and top-quality driver services that make every journey comfortable and worry-free.
                                </p>
                                <p className="mb-4">
                                    Whether it’s a special event, an important business meeting, airport transfer, or you simply want a break from driving, SearchMyDrivers makes traveling easy. With just a few clicks, you can book a professional driver tailored to your specific needs and schedule.
                                </p>
                                <p className="mb-4">
                                    We take pride in delivering excellence. Our drivers are police-verified, licensed, and professionally trained with complete documentation. With extensive knowledge of local routes and traffic conditions, they ensure smooth, timely, and efficient rides every time.
                                </p>
                                <p className="mb-4">
                                    Looking for a driver near you? SearchMyDrivers connects you instantly with experienced drivers available in your area. Book online, track your driver, and enjoy safe, stress-free travel. Your safety, comfort, and time are always our top priorities.
                                </p>
                                <p>
                                    So why wait? Sit back, relax, and let SearchMyDrivers take the wheel — because your journey deserves the best.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-4 text-[#2BB673] font-bold hover:underline focus:outline-none"
                            >
                                {isExpanded ? 'Read Less' : 'Read More...'}
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl p-8 border-t-4 border-l-4 border-[#2BB673] shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] flex justify-between items-center transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer group">
                                <div>
                                    <h3 className="text-4xl font-extrabold text-gray-900 mb-2 group-hover:text-[#2BB673] transition-colors">{stat.number}</h3>
                                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">{stat.label}</p>
                                </div>
                                <div className="relative">
                                    {/* Custom logic to render icons based on text or fallback SVG */}
                                    {(stat.icon === 'users' || stat.label.includes('CLIENTS')) ? (
                                        <div className="flex -space-x-2 mb-1 justify-end">
                                            <svg className="w-5 h-5 text-[#2BB673]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            <svg className="w-5 h-5 text-[#2BB673]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            <svg className="w-5 h-5 text-[#2BB673]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        </div>
                                    ) : (
                                        <svg className="w-16 h-16 text-[#2BB673] opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform scale-150" fill="currentColor" viewBox="0 0 24 24"><path d={stat.icon} /></svg>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Description Section */}
            <section id="features" className="py-24 bg-white relative">
                <div className="container mx-auto px-4 md:px-12 max-w-[1440px]">
                    <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{landingPageData?.whyChooseUs?.heading || 'Why Choose Us?'}</h2>
                        <p className="text-lg text-gray-600">
                            {landingPageData?.whyChooseUs?.subheading || 'We provide a seamless experience for finding the perfect driver for your needs. Safety, reliability, and professionalism are our core values.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(59,130,246,0.1)] border border-blue-100 hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)] transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
                                style={{ animationDelay: `${0.2 * (idx + 1)}s` }}
                            >
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-[#2BB673]">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description || feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Download App Section - User */}
            <section className="py-8 md:py-12 bg-white overflow-hidden">
                <div className="container mx-auto px-4 md:px-12 max-w-[1440px]">
                    <div className="flex flex-row items-center gap-4 md:gap-12">
                        {/* Text Content */}
                        <div className="flex-1 space-y-2 md:space-y-4 animate-fade-in-up min-w-0">
                            <div className="inline-block bg-[#ffbd59]/20 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[#ffbd59] font-bold text-[10px] md:text-sm mb-1 md:mb-2 border border-[#ffbd59]">
                                {landingPageData?.userAppSection?.badge || 'For Users'}
                            </div>
                            <h2 className="text-lg md:text-4xl font-bold text-gray-900 leading-tight">
                                {landingPageData?.userAppSection?.heading || (
                                    <>Download Our <span className="relative inline-block">App <span className="absolute bottom-1 left-0 w-full h-1.5 md:h-3 bg-[#ffbd59]/40 -z-10"></span></span></>
                                )}
                            </h2>

                            <div className="space-y-2 md:space-y-4">
                                <div>
                                    <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-3 flex items-center gap-1.5 md:gap-2">
                                        <span className="w-1 h-4 md:w-1.5 md:h-6 bg-black rounded-full"></span>
                                        {landingPageData?.userAppSection?.detailsTitle || 'Details'}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-[10px] md:text-sm text-justify md:text-left line-clamp-3 md:line-clamp-none">
                                        {landingPageData?.userAppSection?.detailsText || 'Our Driver Service App is a user-friendly platform that connects you with professional, police-verified drivers. With just a few clicks, you can easily book, schedule, and customize your rides.'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-3 flex items-center gap-1.5 md:gap-2">
                                        <span className="w-1 h-4 md:w-1.5 md:h-6 bg-black rounded-full"></span>
                                        {landingPageData?.userAppSection?.howItWorksTitle || 'How it works'}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-[10px] md:text-sm text-justify md:text-left line-clamp-3 md:line-clamp-none">
                                        {landingPageData?.userAppSection?.howItWorksText || 'Our Driver Service App transforms the way you access transportation. Whether you need an immediate ride or want to plan ahead, our app connects you with experienced drivers.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 md:gap-4 pt-2 md:pt-4">
                                <a href={landingPageData?.userAppSection?.playStoreLink || "https://play.google.com/store/apps/details?id=com.searchmydrivers.user"} target="_blank" rel="noopener noreferrer">
                                    <button className="bg-white text-black border md:border-2 border-black px-3 py-1.5 md:px-8 md:py-3 rounded-full flex items-center gap-1.5 md:gap-3 hover:bg-black hover:text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 group">
                                        <svg className="w-4 h-4 md:w-8 md:h-8 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a2.955 2.955 0 01-.194-2.88L3.61 1.814zM15.636 13.845l3.522 3.522a2.388 2.388 0 00.316.273l-3.838-5.694-1.9 1.9zM15.636 10.155l1.9-1.9 3.838-5.694a2.388 2.388 0 00-.316.273l-3.522 3.522zM19.158 5.758a.955.955 0 010 12.484l2.253-3.376c.49-.736.49-1.706 0-2.433l-2.253-3.376z" /></svg>
                                        <div className="text-left leading-none">
                                            <div className="text-[8px] md:text-[10px] uppercase tracking-wider font-bold mb-0.5 md:mb-1">GET IT ON</div>
                                            <div className="text-xs md:text-xl font-extrabold">Google Play</div>
                                        </div>
                                    </button>
                                </a>
                            </div>
                        </div>

                        {/* Images - Phone Mockups */}
                        <div className="flex-1 relative h-[200px] md:h-[400px] flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="relative w-full max-w-[160px] md:max-w-md h-full">
                                <img src={userImages[0]} alt="App Screenshot 1" className="absolute top-5 md:top-10 left-0 w-[42%] transform -rotate-12 z-10 hover:z-30 hover:rotate-0 transition-all duration-500 ease-out" />
                                <img src={userImages[1]} alt="App Screenshot 2" className="absolute top-0 left-1/2 -translate-x-1/2 w-[45%] z-20 hover:scale-105 transition-transform duration-500 ease-out" />
                                <img src={userImages[2]} alt="App Screenshot 3" className="absolute top-10 md:top-20 right-0 w-[42%] transform rotate-12 z-0 hover:z-30 hover:rotate-0 transition-all duration-500 ease-out" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Download App Section - Driver */}
            <section className="py-8 md:py-12 bg-white overflow-hidden">
                <div className="container mx-auto px-4 md:px-12 max-w-[1440px]">
                    <div className="flex flex-row-reverse items-center gap-4 md:gap-16">
                        {/* Text Content */}
                        <div className="flex-1 space-y-2 md:space-y-4 animate-fade-in-up min-w-0">
                            <div className="inline-block bg-[#2BB673]/10 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[#2BB673] font-bold text-[10px] md:text-sm mb-1 md:mb-2 border border-[#2BB673]/20">
                                {landingPageData?.driverAppSection?.badge || 'For Drivers'}
                            </div>
                            <h2 className="text-lg md:text-3xl font-bold text-gray-900 leading-tight">
                                {landingPageData?.driverAppSection?.heading || (
                                    <>Join Our Network <span className="text-[#2BB673] block md:inline">As A Partner</span></>
                                )}
                            </h2>
                            <div className="space-y-2 md:space-y-4">
                                <p className="text-gray-600 leading-relaxed text-[10px] md:text-sm text-justify md:text-left line-clamp-4 md:line-clamp-none">
                                    {landingPageData?.driverAppSection?.description || 'Are you a professional driver looking for consistent earnings and flexible hours? Join SearchMyDriver specifically designed for partners.'}
                                </p>
                                <div className="flex flex-wrap gap-2 md:gap-4 pt-2 md:pt-4">
                                    <a href={landingPageData?.driverAppSection?.playStoreLink || "https://play.google.com/store/apps/details?id=com.searchmydrivers.partner"} target="_blank" rel="noopener noreferrer">
                                        <button className="bg-[#2BB673] text-white px-3 py-1.5 md:px-6 md:py-2.5 rounded-full flex items-center gap-1.5 md:gap-2 hover:bg-[#239960] transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1">
                                            <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            <span className="font-bold text-xs md:text-lg">Download App</span>
                                        </button>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Images - Phone Mockups - Driver */}
                        <div className="flex-1 relative h-[200px] md:h-[400px] flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="relative w-full max-w-[160px] md:max-w-md h-[200px] md:h-[400px] flex justify-center items-center perspective-1000">
                                {driverImages.map((src, index) => {
                                    const diff = (index - activeDriverIndex + driverImages.length) % driverImages.length;
                                    let style = {};
                                    let className = "absolute w-[65%] md:w-[45%] transition-all duration-700 ease-in-out";
                                    if (diff === 0) style = { transform: 'translateX(0) scale(1.1) translateZ(50px)', zIndex: 50, opacity: 1 };
                                    else if (diff === 1) style = { transform: 'translateX(40%) scale(0.9) translateZ(-50px) rotateY(-15deg)', zIndex: 40, opacity: 0.8 };
                                    else if (diff === 2) style = { transform: 'translateX(0) scale(0.8) translateZ(-100px)', zIndex: 30, opacity: 0.5 };
                                    else style = { transform: 'translateX(-40%) scale(0.9) translateZ(-50px) rotateY(15deg)', zIndex: 40, opacity: 0.8 };

                                    return <img key={index} src={src} alt={`Driver App Screen ${index + 1}`} className={className} style={style} />;
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cities We Cater Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 md:px-12 max-w-[1440px]">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-3xl font-bold text-gray-900 mb-4">{landingPageData?.citiesSection?.heading || 'Cities We Cater'}</h2>
                        <p className="text-gray-600 max-w-4xl mx-auto">
                            {landingPageData?.citiesSection?.description || 'We are committed to providing the best possible services in all cities.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {cities.map((city, idx) => (
                            <div key={idx} className="flex flex-col items-center group cursor-pointer">
                                <div className="w-16 h-16 mb-2 relative flex items-center justify-center transform group-hover:-translate-y-2 transition-transform duration-300">
                                    <svg className="w-10 h-10 text-gray-900 z-10 relative bottom-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                    </svg>
                                    <div className="absolute bottom-3 w-8 h-1.5 bg-yellow-400 rounded-full"></div>
                                </div>
                                <h3 className="text-lg font-medium text-gray-800 group-hover:text-[#2BB673] transition-colors">{city}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial Section */}
            <section id="testimonials" className="py-24 bg-gray-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#2BB673]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#239960]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="container mx-auto px-4 md:px-12 relative z-10 max-w-[1440px]">
                    <div className="text-center mb-16 animate-fade-in-up">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{landingPageData?.testimonialsSection?.heading || 'What Our Users Say'}</h2>
                        <div className="w-24 h-1.5 bg-[#2BB673] mx-auto rounded-full mb-6"></div>
                        <button onClick={() => setShowReviewModal(true)} className="inline-flex items-center gap-2 px-6 py-2 bg-white border-2 border-[#2BB673] text-[#2BB673] rounded-full font-bold hover:bg-[#2BB673] hover:text-white transition-all shadow-md hover:shadow-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Write a Review
                        </button>
                    </div>

                    <div className="flex overflow-x-auto space-x-8 pb-8 snap-x snap-mandatory scrollbar-hide">
                        {testimonials.map((testimonial, idx) => (
                            <div key={idx} className="min-w-[300px] md:min-w-[350px] bg-white p-8 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-blue-200 relative animate-fade-in-up hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] transition-all duration-300 snap-center" style={{ animationDelay: `${0.2 * (idx + 1)}s` }}>
                                <div className="text-blue-200 absolute top-6 right-6 opacity-40">
                                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.0547 15.3789 13.5547 17.5352 12.0078L18.4219 12.6484C17.0273 13.9219 16.5117 14.8281 16.5117 15.6875L16.5117 18L19.5078 18L19.5078 21L14.017 21ZM5.01562 21L5.01562 18C5.01562 16.0547 6.375 13.5547 8.53125 12.0078L9.42188 12.6484C8.02734 13.9219 7.51172 14.8281 7.51172 15.6875L7.51172 18L10.5078 18L10.5078 21L5.01562 21Z" /></svg>
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                                        <img src={testimonial.avatar || `https://i.pravatar.cc/150?u=${testimonial.name}`} alt={testimonial.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic">"{testimonial.content || testimonial.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-12 max-w-[1440px]">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{landingPageData?.faqSection?.heading || 'Frequently Asked Questions'}</h2>
                        <div className="w-24 h-1.5 bg-[#2BB673] mx-auto rounded-full mb-6"></div>
                    </div>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md">
                                <button className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors focus:outline-none" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                                    <span className={`font-semibold transition-colors duration-300 ${openFaq === index ? 'text-[#2BB673]' : 'text-gray-900'}`}>{faq.question}</span>
                                    <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-[#2BB673]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-6 py-4 bg-white text-gray-600 border-t border-gray-200">{faq.answer}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
            {/* Review Modal code remains same... */}
            {showReviewModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Share Your Experience</h3>
                            <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form className="space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            alert("Thank you for your review! It has been submitted for moderation.");
                            setShowReviewModal(false);
                        }}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent outline-none transition-all" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role (Optional)</label>
                                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent outline-none transition-all" placeholder="Daily Commuter, Business Traveler..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} type="button" className="text-yellow-400 hover:scale-110 transition-transform">
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                                <textarea required rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent outline-none transition-all resize-none" placeholder="Tell us about your experience..."></textarea>
                            </div>
                            <button type="submit" className="w-full bg-[#2BB673] text-white font-bold py-3 rounded-lg hover:bg-[#239960] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                Submit Review
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
