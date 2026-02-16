
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

const Footer = () => {
    const [socialLinks, setSocialLinks] = useState({
        facebook: '',
        instagram: '',
        youtube: '',
        twitter: '',
        linkedin: ''
    });

    useEffect(() => {
        const fetchSocialLinks = async () => {
            try {
                const response = await api.get('/landing-page');
                if (response.data.success && response.data.data.socialLinks) {
                    setSocialLinks(response.data.data.socialLinks);
                }
            } catch (error) {
                console.error('Error fetching social links:', error);
            }
        };
        fetchSocialLinks();
    }, []);

    return (
        <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
            <div className="container mx-auto px-4 md:px-12 max-w-[1440px]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
                    <div>
                        <img src="/logo/logoimage-removebg-preview.png" alt="SearchMyDriver" className="h-40 w-auto object-contain mb-4 block mx-auto md:mx-0" />
                        <p className="text-gray-400 mb-6">Connecting you with the best drivers in town.</p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4 justify-center md:justify-start ring-offset-gray-900 mb-4">
                            {socialLinks.facebook && (
                                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-[#2BB673] hover:text-white transition-all duration-300 shadow-lg">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                                </a>
                            )}
                            {socialLinks.instagram && (
                                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-[#2BB673] hover:text-white transition-all duration-300 shadow-lg">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                </a>
                            )}
                            {socialLinks.youtube && (
                                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-[#2BB673] hover:text-white transition-all duration-300 shadow-lg">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                </a>
                            )}
                            {socialLinks.twitter && (
                                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-[#2BB673] hover:text-white transition-all duration-300 shadow-lg">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                </a>
                            )}
                            {socialLinks.linkedin && (
                                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-[#2BB673] hover:text-white transition-all duration-300 shadow-lg">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                </a>
                            )}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/" className="hover:text-[#4169E1] hover:drop-shadow-[0_0_10px_rgba(0,0,139,0.9)] transition-colors">Home</Link></li>
                            <li><Link to="/services" className="hover:text-[#4169E1] hover:drop-shadow-[0_0_10px_rgba(0,0,139,0.9)] transition-colors">Services</Link></li>
                            <li><Link to="/#features" className="hover:text-[#4169E1] hover:drop-shadow-[0_0_10px_rgba(0,0,139,0.9)] transition-colors">Features</Link></li>
                            <li><Link to="/#testimonials" className="hover:text-[#4169E1] hover:drop-shadow-[0_0_10px_rgba(0,0,139,0.9)] transition-colors">Testimonials</Link></li>
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
                        <h4 className="font-bold mb-6 text-white tracking-wide">Download Our Apps</h4>
                        <div className="flex flex-col gap-4 items-center md:items-start">
                            {/* User App */}
                            <a
                                href="https://play.google.com/store/apps/details?id=com.searchmydrivers.user"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-black border border-gray-700 rounded-xl px-4 py-2 hover:bg-gray-800 transition-all group w-[180px]"
                            >
                                <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24">
                                    <path d="M17.523 15.3414L20.155 12.7094C20.615 12.2494 20.615 11.7504 20.155 11.2914L17.523 8.65842L14.153 12.0004L17.523 15.3414Z" fill="#FBC02D" />
                                    <path d="M17.523 8.65842L5.808 2.01342C5.552 1.86842 5.253 1.81542 4.965 1.86042L14.153 12.0004L17.523 8.65842Z" fill="#E53935" />
                                    <path d="M4.965 22.1404C5.253 22.1854 5.552 22.1324 5.808 21.9874L17.523 15.3414L14.153 12.0004L4.965 22.1404Z" fill="#0B9FCF" />
                                    <path d="M4.965 1.86042C4.385 1.95142 3.939 2.45542 3.939 3.06542V20.9354C3.939 21.5454 4.385 22.0494 4.965 22.1404L14.153 12.0004L4.965 1.86042Z" fill="#3D8D52" />
                                </svg>
                                <div className="text-left">
                                    <p className="text-[10px] uppercase font-medium text-gray-400 leading-none mb-1">Get it on</p>
                                    <p className="text-sm font-bold text-white leading-none">User App</p>
                                </div>
                            </a>

                            {/* Driver App */}
                            <a
                                href="https://play.google.com/store/apps/details?id=com.searchmydrivers.partner"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-black border border-gray-700 rounded-xl px-4 py-2 hover:bg-gray-800 transition-all group w-[180px]"
                            >
                                <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24">
                                    <path d="M17.523 15.3414L20.155 12.7094C20.615 12.2494 20.615 11.7504 20.155 11.2914L17.523 8.65842L14.153 12.0004L17.523 15.3414Z" fill="#FBC02D" />
                                    <path d="M17.523 8.65842L5.808 2.01342C5.552 1.86842 5.253 1.81542 4.965 1.86042L14.153 12.0004L17.523 8.65842Z" fill="#E53935" />
                                    <path d="M4.965 22.1404C5.253 22.1854 5.552 22.1324 5.808 21.9874L17.523 15.3414L14.153 12.0004L4.965 22.1404Z" fill="#0B9FCF" />
                                    <path d="M4.965 1.86042C4.385 1.95142 3.939 2.45542 3.939 3.06542V20.9354C3.939 21.5454 4.385 22.0494 4.965 22.1404L14.153 12.0004L4.965 1.86042Z" fill="#3D8D52" />
                                </svg>
                                <div className="text-left">
                                    <p className="text-[10px] uppercase font-medium text-gray-400 leading-none mb-1">Get it on</p>
                                    <p className="text-sm font-bold text-white leading-none">Driver App</p>
                                </div>
                            </a>
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
