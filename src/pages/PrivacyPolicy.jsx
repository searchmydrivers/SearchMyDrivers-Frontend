import React, { useEffect, useState } from 'react';
import { contentService } from '../services/contentService';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Default content now uses semantic HTML without inline classes, relying on the parent container's styles
    const defaultContent = `
        <section>
            <h2>1. Introduction</h2>
            <p>
                Welcome to <strong>SearchMyDriver</strong>. We respect your privacy and are committed to protecting your personal data.
                This privacy policy will inform you as to how we look after your personal data when you visit our website or use our mobile application
                and tell you about your privacy rights and how the law protects you.
            </p>
        </section>

        <section>
            <h2>2. Information We Collect</h2>
            <p>We collect several different types of information for various purposes to provide and improve our Service to you:</p>
            <ul>
                <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to: Email address, First name and last name, Phone number, Address, State, Province, ZIP/Postal code, City.</li>
                <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used ("Usage Data").</li>
                <li><strong>Location Data:</strong> We use your location data to provide features of our Service, to improve and customize our Service. You can enable or disable location services when you use our Service at any time, through your device settings.</li>
            </ul>
        </section>

        <section>
            <h2>3. Use of Data</h2>
            <p>SearchMyDriver uses the collected data for various purposes:</p>
            <ul>
                <li>To provide and maintain the Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                <li>To provide customer care and support</li>
                <li>To provide analysis or valuable information so that we can improve the Service</li>
                <li>To monitor the usage of the Service</li>
                <li>To detect, prevent and address technical issues</li>
            </ul>
        </section>

        <section>
            <h2>4. Security of Data</h2>
            <p>
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure.
                While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
        </section>

        <section>
            <h2>5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul>
                <li>By email: support@searchmydriver.com</li>
                <li>By visiting this page on our website: searchmydriver.com/contact</li>
            </ul>
        </section>
    `;

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await contentService.getContentByType('privacy-policy');
                if (response.success && response.data?.content) {
                    setContent(response.data.content);
                }
            } catch (error) {
                console.error("Failed to fetch privacy policy:", error);
            } finally {
                setLoading(false);
            }
        };

        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        fetchContent();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatDisplayContent = (rawContent) => {
        if (!rawContent) return '';

        // If it already looks like HTML (has tags), trust it and return as is
        if (/<[a-z][\s\S]*>/i.test(rawContent)) {
            return rawContent;
        }

        // Process plain text keying off double newlines as blocks
        return rawContent
            .replace(/\r\n/g, '\n') // Normalize newlines
            .split('\n\n')
            .map(block => {
                const trimmedBlock = block.trim();
                if (!trimmedBlock) return '';

                // Check for Heading (e.g., "1. Introduction")
                if (/^\d+\./.test(trimmedBlock)) {
                    return `<h2>${trimmedBlock}</h2>`;
                }

                // Check for Lists (starting with - or •)
                if (trimmedBlock.startsWith('-') || trimmedBlock.startsWith('•')) {
                    const listItems = trimmedBlock
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line.startsWith('-') || line.startsWith('•'))
                        .map(line => `<li><strong>${line.replace(/^[-•]\s*/, '').split(':')[0]}:</strong>${line.replace(/^[-•]\s*/, '').split(':').slice(1).join(':')}</li>`) // Attempt to Bold keys like "key: value"
                        .join('');
                    return `<ul>${listItems}</ul>`;
                }

                // Default to Paragraph
                return `<p>${trimmedBlock.replace(/\n/g, '<br/>')}</p>`;
            })
            .join('');
    };

    const displayContent = formatDisplayContent(content?.content || defaultContent);
    const lastUpdated = content?.updatedAt ? new Date(content.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2BB673]"></div>
            </div>
        );
    }

    return (
        <div className="font-sans antialiased text-gray-900 bg-gray-50 min-h-screen py-8 px-4 md:px-12 relative">
            <div className="max-w-4xl mx-auto">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center text-gray-600 hover:text-[#2BB673] transition-colors font-medium group"
                >
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mr-2 group-hover:shadow-md transition-all">
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </div>
                    Back to Home
                </button>

                <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-xl shadow-gray-200/50 animate-fade-in-up border border-white/50 relative overflow-hidden">

                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-gray-100 pb-8">
                            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                                {content?.title || 'Privacy Policy'}
                            </h1>
                            <div className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-full border border-gray-100 shadow-sm">
                                <svg className="w-4 h-4 text-[#2BB673] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-sm font-medium text-gray-500">
                                    Last Updated: <span className="text-gray-900">{lastUpdated}</span>
                                </span>
                            </div>
                        </div>

                        <div
                            className="
                                space-y-8 text-gray-600 leading-relaxed text-lg
                                [&>section>h2]:text-2xl [&>section>h2]:font-bold [&>section>h2]:text-[#2BB673] [&>section>h2]:mb-4 [&>section>h2]:flex [&>section>h2]:items-center [&>section>h2]:before:content-[''] [&>section>h2]:before:w-2 [&>section>h2]:before:h-8 [&>section>h2]:before:bg-[#2BB673] [&>section>h2]:before:mr-3 [&>section>h2]:before:rounded-full
                                [&>section>p]:mb-6 [&>section>p]:text-gray-600 [&>section>p]:leading-8
                                [&>section>ul]:list-none [&>section>ul]:space-y-3 [&>section>ul]:mb-6
                                [&>section>ul>li]:text-gray-600 [&>section>ul>li]:flex [&>section>ul>li]:items-start [&>section>ul>li]:before:content-['•'] [&>section>ul>li]:before:text-[#2BB673] [&>section>ul>li]:before:font-bold [&>section>ul>li]:before:mr-3
                                [&>section>ul>li>strong]:font-semibold [&>section>ul>li>strong]:text-gray-900
                                
                                /* Flat structure support */
                                [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-[#2BB673] [&>h2]:mb-4 [&>h2]:flex [&>h2]:items-center [&>h2]:before:content-[''] [&>h2]:before:w-2 [&>h2]:before:h-8 [&>h2]:before:bg-[#2BB673] [&>h2]:before:mr-3 [&>h2]:before:rounded-full
                                [&>p]:mb-6 [&>p]:text-gray-600 [&>p]:leading-8
                                [&>ul]:list-none [&>ul]:space-y-3 [&>ul]:mb-6
                                [&>ul>li]:text-gray-600 [&>ul>li]:flex [&>ul>li]:items-start [&>ul>li]:before:content-['•'] [&>ul>li]:before:text-[#2BB673] [&>ul>li]:before:font-bold [&>ul>li]:before:mr-3
                                [&>ul>li>strong]:font-semibold [&>ul>li>strong]:text-gray-900
                            "
                            dangerouslySetInnerHTML={{ __html: displayContent }}
                        />
                    </div>
                </div>
            </div>

            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 p-3 rounded-full bg-[#2BB673] text-white shadow-lg shadow-green-200 transition-all duration-300 transform hover:scale-110 hover:bg-[#239960] z-50 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </button>
        </div>
    );
};

export default PrivacyPolicy;
