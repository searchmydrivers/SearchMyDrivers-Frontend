import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsOfService = () => {
    return (
        <div className="font-sans antialiased text-gray-900 bg-gray-50 min-h-screen">
            <Helmet>
                <title>Terms of Service | SearchMyDrivers</title>
                <meta name="description" content="Read our terms of service to understand the rules, guidelines, and legal agreements for using SearchMyDrivers services." />
                <link rel="canonical" href="https://searchmydrivers.com/terms-of-service" />
            </Helmet>
            <Navbar />
            <div className="py-24 px-4 md:px-12 pt-32">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-lg animate-fade-in-up">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 border-b pb-4">Terms of Service</h1>

                    <p className="text-gray-600 mb-6 italic">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="space-y-8 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-[#2BB673] mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using the <strong>SearchMyDriver</strong> website and mobile application (the "Service"), you agree to be bound by these Terms.
                                If you disagree with any part of the terms then you may not access the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2BB673] mb-4">2. Use of Service</h2>
                            <p>
                                You represent and warrant that you are at least 18 years of age and by using this Service, you warrant that you are at least 18 years of age and are fully able and competent to enter into the terms, conditions, obligations, affirmations, representations, and warranties set forth in these Terms.
                            </p>
                            <p className="mt-4">
                                You agree not to use the Service for any unlawful purpose or any purpose prohibited under this clause.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2BB673] mb-4">3. User Accounts</h2>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>To access most features of the Service, you must register for an account.</li>
                                <li>You agree to provide accurate, current and complete information during the registration process.</li>
                                <li>You are responsible for safeguarding the password that you use to access the Service.</li>
                                <li>You agree not to disclose your password to any third party.</li>
                                <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2BB673] mb-4">4. Content</h2>
                            <p>
                                Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content").
                                You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2BB673] mb-4">5. Intellectual Property</h2>
                            <p>
                                The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of SearchMyDriver and its licensors.
                                The Service is protected by copyright, trademark, and other laws of both India and foreign countries.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2BB673] mb-4">6. Termination</h2>
                            <p>
                                We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                                All provisions of the Terms which by their nature should survive termination shall survive termination.
                            </p>
                        </section>


                        <section>
                            <h2 className="text-2xl font-bold text-[#2BB673] mb-4">7. Changes</h2>
                            <p>
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
                                What constitutes a material change will be determined at our sole discretion.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2BB673] mb-4">8. Contact Us</h2>
                            <p>If you have any questions about these Terms, please contact us:</p>
                            <ul className="list-disc pl-6 mt-2">
                                <li>By email: legal@searchmydriver.com</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TermsOfService;
