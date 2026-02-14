
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHomePage = location.pathname === '/';
    const isServicesPage = location.pathname === '/services';

    const getLinkPath = (hash) => {
        return isHomePage ? hash : `/${hash}`;
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-[#239960] py-4 shadow-lg'
                : isServicesPage
                    ? 'bg-transparent py-6'
                    : 'bg-[#239960] py-6'
            }`}>
            <div className="container mx-auto px-4 md:px-12 flex justify-between items-center max-w-[1440px]">
                <div className="flex items-center gap-2">
                    <Link to="/">
                        <img src="/image.png" alt="SearchMyDriver" className="h-16 w-auto object-contain" />
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <a href={getLinkPath('#features')} className="text-white/90 hover:text-[#00008B] hover:drop-shadow-[0_0_10px_rgba(0,0,139,0.8)] transition-colors font-medium">Features</a>
                    <Link to="/services" className="text-white/90 hover:text-[#00008B] hover:drop-shadow-[0_0_10px_rgba(0,0,139,0.8)] transition-colors font-medium">Services</Link>
                    <a href={getLinkPath('#testimonials')} className="text-white/90 hover:text-[#00008B] hover:drop-shadow-[0_0_10px_rgba(0,0,139,0.8)] transition-colors font-medium">Testimonials</a>
                    <Link to="/contact" className="text-white/90 hover:text-[#00008B] hover:drop-shadow-[0_0_10px_rgba(0,0,139,0.8)] transition-colors font-medium">Contact Us</Link>
                    <Link to="/login" className="bg-white text-[#239960] px-6 py-2.5 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-md">
                        Login
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 bg-[#239960] p-4 md:hidden shadow-lg border-t border-white/10">
                    <div className="flex flex-col gap-4">
                        <a href={getLinkPath('#features')} className="text-white font-medium" onClick={() => setIsOpen(false)}>Features</a>
                        <a href={getLinkPath('#testimonials')} className="text-white font-medium" onClick={() => setIsOpen(false)}>Testimonials</a>
                        <Link to="/contact" className="text-white font-medium" onClick={() => setIsOpen(false)}>Contact Us</Link>
                        <Link to="/login" className="text-white font-bold bg-white/20 p-2 rounded text-center" onClick={() => setIsOpen(false)}>Login</Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
