
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
            <div className="container mx-auto px-4 md:px-12 max-w-[1440px]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <img src="/image.png" alt="SearchMyDriver" className="h-40 w-auto object-contain mb-4 block" />
                        <p className="text-gray-400">Connecting you with the best drivers in town.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/" className="hover:text-[#4169E1] hover:drop-shadow-[0_0_10px_rgba(0,0,139,0.9)] transition-colors">Home</Link></li>
                            <li><Link to="/services" className="hover:text-[#4169E1] hover:drop-shadow-[0_0_10px_rgba(0,0,139,0.9)] transition-colors">Services</Link></li>
                            <li><a href="/#features" className="hover:text-[#4169E1] hover:drop-shadow-[0_0_10px_rgba(0,0,139,0.9)] transition-colors">Features</a></li>
                            <li><Link to="/contact" className="hover:text-[#4169E1] hover:drop-shadow-[0_0_10px_rgba(0,0,139,0.9)] transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/privacy-policy" className="hover:text-[#4169E1] hover:drop-shadow-[0_0_10px_rgba(0,0,139,0.9)] transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms-of-service" className="hover:text-[#4169E1] hover:drop-shadow-[0_0_10px_rgba(0,0,139,0.9)] transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Newsletter</h4>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Enter your email" className="bg-gray-800 border-none rounded px-4 py-2 text-white w-full focus:ring-1 focus:ring-green-500" />
                            <button className="bg-[#00008B] px-4 py-2 rounded text-white font-medium hover:bg-[#0000CD] transition-all shadow-[0_0_30px_rgba(0,0,139,0.8)] hover:shadow-[0_0_40px_rgba(0,0,139,1)] border-2 border-[#00008B] transform hover:-translate-y-0.5">Subscribe</button>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} SearchMyDriver. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
