import React, { useEffect, useState } from 'react';
import { contentService } from '../services/contentService';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Default content now uses semantic HTML without inline classes, relying on the parent container's styles
    const defaultContent = `
        <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
                By accessing or using the <strong>SearchMyDriver</strong> website and mobile application (the "Service"), you agree to be bound by these Terms.
                If you disagree with any part of the terms then you may not access the Service.
            </p>
        </section>

        <section>
            <h2>2. Use of Service</h2>
            <p>
                You represent and warrant that you are at least 18 years of age and by using this Service, you warrant that you are at least 18 years of age and are fully able and competent to enter into the terms, conditions, obligations, affirmations, representations, and warranties set forth in these Terms.
            </p>
            <p>
                You agree not to use the Service for any unlawful purpose or any purpose prohibited under this clause.
            </p>
        </section>

        <section>
            <h2>3. User Accounts</h2>
            <ul>
                <li>To access most features of the Service, you must register for an account.</li>
                <li>You agree to provide accurate, current and complete information during the registration process.</li>
                <li>You are responsible for safeguarding the password that you use to access the Service.</li>
                <li>You agree not to disclose your password to any third party.</li>
                <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
            </ul>
        </section>

        <section>
            <h2>4. Content</h2>
            <p>
                Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content").
                You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
            </p>
        </section>

        <section>
            <h2>5. Intellectual Property</h2>
            <p>
                The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of SearchMyDriver and its licensors.
                The Service is protected by copyright, trademark, and other laws of both India and foreign countries.
            </p>
        </section>

        <section>
            <h2>6. Termination</h2>
            <p>
                We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                All provisions of the Terms which by their nature should survive termination shall survive termination.
            </p>
        </section>

        <section>
            <h2>7. Changes</h2>
            <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
                What constitutes a material change will be determined at our sole discretion.
            </p>
        </section>

        <section>
            <h2>8. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us:</p>
            <ul>
                <li>By email: legal@searchmydriver.com</li>
            </ul>
        </section>
    `;

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await contentService.getContentByType('terms-conditions');
                if (response.success && response.data?.content) {
                    setContent(response.data.content);
                }
            } catch (error) {
                console.error("Failed to fetch terms of service:", error);
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
        if (/<[a-z][\s\S]*>/i.test(rawContent)) return rawContent;

        const lines = rawContent.replace(/\r\n/g, '\n').split('\n');
        let html = '';
        let inList = false;

        lines.forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                return;
            }

            // List Item
            if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                const content = trimmed.replace(/^[-•]\s*/, '');
                // Try to bold keys if they look like "Key: Value"
                const parts = content.split(':');
                if (parts.length > 1 && parts[0].length < 50) {
                    html += `<li><strong>${parts[0]}:</strong>${parts.slice(1).join(':')}</li>`;
                } else {
                    html += `<li>${content}</li>`;
                }
                return;
            }

            // If we were in a list, close it now
            if (inList) {
                html += '</ul>';
                inList = false;
            }

            // Heading (Start with number+dot, and reasonably short)
            if (/^\d+\./.test(trimmed) && trimmed.length < 100) {
                html += `<h2>${trimmed}</h2>`;
                return;
            }

            // Paragraph
            html += `<p>${trimmed}</p>`;
        });

        if (inList) html += '</ul>';
        return html;
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
                                {content?.title || 'Terms of Service'}
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

export default TermsOfService;
