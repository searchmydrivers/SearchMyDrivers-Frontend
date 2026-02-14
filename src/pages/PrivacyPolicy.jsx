import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="font-sans antialiased text-gray-900 bg-gray-50 min-h-screen py-12 px-4 md:px-12">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-lg animate-fade-in-up">
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 border-b pb-4">Privacy Policy</h1>

                <p className="text-gray-600 mb-6 italic">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-[#2BB673] mb-4">1. Introduction</h2>
                        <p>
                            Welcome to <strong>SearchMyDriver</strong>. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you as to how we look after your personal data when you visit our website or use our mobile application
                            and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#2BB673] mb-4">2. Information We Collect</h2>
                        <p className="mb-4">We collect several different types of information for various purposes to provide and improve our Service to you:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to: Email address, First name and last name, Phone number, Address, State, Province, ZIP/Postal code, City.</li>
                            <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used ("Usage Data").</li>
                            <li><strong>Location Data:</strong> We use your location data to provide features of our Service, to improve and customize our Service. You can enable or disable location services when you use our Service at any time, through your device settings.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#2BB673] mb-4">3. Use of Data</h2>
                        <p>SearchMyDriver uses the collected data for various purposes:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
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
                        <h2 className="text-2xl font-bold text-[#2BB673] mb-4">4. Security of Data</h2>
                        <p>
                            The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure.
                            While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#2BB673] mb-4">5. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us:</p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>By email: support@searchmydriver.com</li>
                            <li>By visiting this page on our website: searchmydriver.com/contact</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
