import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout/Layout';

const LandingPageManager = () => {
    const [activeSection, setActiveSection] = useState('stats');
    const [landingPageData, setLandingPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Fetch landing page data
    useEffect(() => {
        fetchLandingPageData();
    }, []);

    const fetchLandingPageData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/landing-page`);
            if (response.data.success) {
                setLandingPageData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching landing page data:', error);
            showMessage('error', 'Failed to load landing page data');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleSave = async (section, data) => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_URL}/landing-page/${section}`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                showMessage('success', 'Section updated successfully!');
                fetchLandingPageData();
            }
        } catch (error) {
            console.error('Error updating section:', error);
            showMessage('error', error.response?.data?.message || 'Failed to update section');
        } finally {
            setSaving(false);
        }
    };

    const sections = [
        { id: 'stats', name: 'Stats Section', icon: '📊' },
        { id: 'features', name: 'Why Choose Us', icon: '⭐' },
        { id: 'userApp', name: 'User App', icon: '📱' },
        { id: 'driverApp', name: 'Driver App', icon: '🚗' },
        { id: 'cities', name: 'Cities', icon: '🏙️' },
        { id: 'testimonials', name: 'Testimonials', icon: '💬' },
        { id: 'faq', name: 'FAQ', icon: '❓' },
        { id: 'services', name: 'Services Page', icon: '🛠️' },
        { id: 'contact', name: 'Contact Page', icon: '📞' },
        { id: 'privacy', name: 'Privacy Policy', icon: '🔒' },
        { id: 'terms', name: 'Terms of Service', icon: '📜' },
        { id: 'mission', name: 'Mission/About', icon: '📝' }
    ];

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2BB673]"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <h1 className="text-2xl font-bold text-gray-900">Landing Page Manager</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage all sections of your landing page</p>
                    </div>
                </div>

                {/* Message Alert */}
                {message.text && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                        <div className={`p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                            }`}>
                            <div className="flex items-center">
                                {message.type === 'success' ? (
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                )}
                                <span className="font-medium">{message.text}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
                                <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Sections</h2>
                                <nav className="space-y-1">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${activeSection === section.id
                                                ? 'bg-[#2BB673] text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span className="text-xl">{section.icon}</span>
                                            <span className="font-medium text-sm">{section.name}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">

                            {activeSection === 'stats' && (
                                <StatsSectionEditor
                                    data={landingPageData?.statsSection}
                                    onSave={(data) => handleSave('stats-section', data)}
                                    saving={saving}
                                />
                            )}
                            {activeSection === 'features' && (
                                <WhyChooseUsEditor
                                    data={landingPageData?.whyChooseUs}
                                    onSave={(data) => handleSave('why-choose-us', data)}
                                    saving={saving}
                                />
                            )}
                            {activeSection === 'userApp' && (
                                <UserAppSectionEditor
                                    data={landingPageData?.userAppSection}
                                    onSave={(data) => handleSave('user-app-section', data)}
                                    saving={saving}
                                />
                            )}
                            {activeSection === 'driverApp' && (
                                <DriverAppSectionEditor
                                    data={landingPageData?.driverAppSection}
                                    onSave={(data) => handleSave('driver-app-section', data)}
                                    saving={saving}
                                />
                            )}
                            {activeSection === 'cities' && (
                                <CitiesSectionEditor
                                    data={landingPageData?.citiesSection}
                                    onSave={(data) => handleSave('cities-section', data)}
                                    saving={saving}
                                />
                            )}
                            {activeSection === 'testimonials' && (
                                <TestimonialsSectionEditor
                                    data={landingPageData?.testimonialsSection}
                                    onSave={(data) => handleSave('testimonials-section', data)}
                                    saving={saving}
                                />
                            )}
                            {activeSection === 'faq' && (
                                <FAQSectionEditor
                                    data={landingPageData?.faqSection}
                                    onSave={(data) => handleSave('faq-section', data)}
                                    saving={saving}
                                />
                            )}
                            {activeSection === 'privacy' && (
                                <LegalContentEditor
                                    type="privacy-policy"
                                    title="Privacy Policy"
                                />
                            )}
                            {activeSection === 'terms' && (
                                <LegalContentEditor
                                    type="terms-conditions"
                                    title="Terms of Service"
                                />
                            )}
                            {activeSection === 'mission' && (
                                <LegalContentEditor
                                    type="landing-page-about"
                                    title="Mission / About Section"
                                    defaultTitle="Hassle-Free Commute with #1 Driver Service – SearchMyDrivers"
                                />
                            )}
                            {activeSection === 'services' && (
                                <ServicesPageEditor />
                            )}
                            {activeSection === 'contact' && (
                                <ContactPageEditor />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// Hero Section Editor Component
const HeroSectionEditor = ({ data, onSave, saving }) => {
    const [formData, setFormData] = useState({
        title1: '',
        title2: '',
        description: '',
        buttonText: '',
        carImage: ''
    });

    useEffect(() => {
        if (data) {
            setFormData(data);
        }
    }, [data]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Hero Section</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title Line 1</label>
                    <input
                        type="text"
                        name="title1"
                        value={formData.title1}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                        placeholder="e.g., Your Trusted"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title Line 2 (Highlighted)</label>
                    <input
                        type="text"
                        name="title2"
                        value={formData.title2}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                        placeholder="e.g., Driving Partner"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent resize-none"
                        placeholder="Enter description..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                    <input
                        type="text"
                        name="buttonText"
                        value={formData.buttonText}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                        placeholder="e.g., Get Started"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Car Image URL</label>
                    <input
                        type="text"
                        name="carImage"
                        value={formData.carImage}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                        placeholder="Image URL or path"
                    />
                </div>

                {/* Preview */}
                <div className="bg-gradient-to-br from-[#2BB673] to-[#239960] rounded-lg p-6">
                    <h3 className="text-white text-xs font-semibold mb-3 uppercase">Preview</h3>
                    <h1 className="text-3xl font-extrabold text-white leading-tight mb-3">
                        <span className="block">{formData.title1 || 'Title Line 1'}</span>
                        <span className="block text-[#dcfce7]">{formData.title2 || 'Title Line 2'}</span>
                    </h1>
                    <p className="text-white/90 mb-4">{formData.description || 'Description...'}</p>
                    <button type="button" className="bg-white text-[#239960] px-6 py-2 rounded-full font-bold text-sm">
                        {formData.buttonText || 'Button Text'}
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#2BB673] text-white py-3 rounded-lg font-bold hover:bg-[#239960] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

// Stats Section Editor Component
const StatsSectionEditor = ({ data, onSave, saving }) => {
    const [formData, setFormData] = useState({
        heading: '',
        description: '',
        stats: []
    });

    useEffect(() => {
        if (data) {
            setFormData(data);
        }
    }, [data]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStatChange = (index, field, value) => {
        const newStats = [...formData.stats];
        newStats[index][field] = value;
        setFormData({ ...formData, stats: newStats });
    };

    const addStat = () => {
        setFormData({
            ...formData,
            stats: [...formData.stats, { number: '', label: '' }]
        });
    };

    const removeStat = (index) => {
        const newStats = formData.stats.filter((_, i) => i !== index);
        setFormData({ ...formData, stats: newStats });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Stats Section</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
                    <input
                        type="text"
                        name="heading"
                        value={formData.heading}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent resize-none"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">Stats</label>
                        <button
                            type="button"
                            onClick={addStat}
                            className="text-sm bg-[#2BB673] text-white px-3 py-1 rounded-lg hover:bg-[#239960]"
                        >
                            + Add Stat
                        </button>
                    </div>
                    <div className="space-y-3">
                        {formData.stats?.map((stat, index) => (
                            <div key={index} className="flex gap-3 items-start p-3 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={stat.number}
                                        onChange={(e) => handleStatChange(index, 'number', e.target.value)}
                                        placeholder="Number (e.g., 20000+)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                                    />
                                    <input
                                        type="text"
                                        value={stat.label}
                                        onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                                        placeholder="Label (e.g., VERIFIED DRIVERS)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeStat(index)}
                                    className="text-red-600 hover:text-red-800 p-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#2BB673] text-white py-3 rounded-lg font-bold hover:bg-[#239960] transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

// Why Choose Us Editor Component
const WhyChooseUsEditor = ({ data, onSave, saving }) => {
    const [formData, setFormData] = useState({
        heading: '',
        subheading: '',
        features: []
    });

    useEffect(() => {
        if (data) {
            setFormData(data);
        }
    }, [data]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFeatureChange = (index, field, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index][field] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
        setFormData({
            ...formData,
            features: [...formData.features, { title: '', description: '', icon: '' }]
        });
    };

    const removeFeature = (index) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Why Choose Us Section</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
                    <input
                        type="text"
                        name="heading"
                        value={formData.heading}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subheading</label>
                    <textarea
                        name="subheading"
                        value={formData.subheading}
                        onChange={handleChange}
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent resize-none"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">Features</label>
                        <button
                            type="button"
                            onClick={addFeature}
                            className="text-sm bg-[#2BB673] text-white px-3 py-1 rounded-lg hover:bg-[#239960]"
                        >
                            + Add Feature
                        </button>
                    </div>
                    <div className="space-y-3">
                        {formData.features?.map((feature, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-medium text-gray-900">Feature {index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={feature.title}
                                    onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                                    placeholder="Feature Title"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                                />
                                <textarea
                                    value={feature.description}
                                    onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                                    placeholder="Feature Description"
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 resize-none"
                                />
                                <input
                                    type="text"
                                    value={feature.icon}
                                    onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                                    placeholder="SVG Path (optional)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#2BB673] text-white py-3 rounded-lg font-bold hover:bg-[#239960] transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

// User App Section Editor
const UserAppSectionEditor = ({ data, onSave, saving }) => {
    const [formData, setFormData] = useState({
        badge: '',
        heading: '',
        detailsTitle: '',
        detailsText: '',
        howItWorksTitle: '',
        howItWorksText: '',
        playStoreLink: '',
        appImages: []
    });

    useEffect(() => {
        if (data) {
            setFormData(data);
        }
    }, [data]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.appImages];
        newImages[index] = value;
        setFormData({ ...formData, appImages: newImages });
    };

    const addImage = () => {
        setFormData({ ...formData, appImages: [...formData.appImages, ''] });
    };

    const removeImage = (index) => {
        const newImages = formData.appImages.filter((_, i) => i !== index);
        setFormData({ ...formData, appImages: newImages });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">User App Section</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                        <input
                            type="text"
                            name="badge"
                            value={formData.badge}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                            placeholder="e.g., For Users"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
                        <input
                            type="text"
                            name="heading"
                            value={formData.heading}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Details Title</label>
                    <input
                        type="text"
                        name="detailsTitle"
                        value={formData.detailsTitle}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Details Text</label>
                    <textarea
                        name="detailsText"
                        value={formData.detailsText}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">How It Works Title</label>
                    <input
                        type="text"
                        name="howItWorksTitle"
                        value={formData.howItWorksTitle}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">How It Works Text</label>
                    <textarea
                        name="howItWorksText"
                        value={formData.howItWorksText}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Play Store Link</label>
                    <input
                        type="url"
                        name="playStoreLink"
                        value={formData.playStoreLink}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">App Images</label>
                        <button
                            type="button"
                            onClick={addImage}
                            className="text-sm bg-[#2BB673] text-white px-3 py-1 rounded-lg hover:bg-[#239960]"
                        >
                            + Add Image
                        </button>
                    </div>
                    <div className="space-y-2">
                        {formData.appImages?.map((image, index) => (
                            <div key={index} className="flex gap-2">
                                <ImageUploader
                                    value={image}
                                    onChange={(url) => handleImageChange(index, url)}
                                    placeholder="Image URL"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="text-red-600 hover:text-red-800 px-3"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#2BB673] text-white py-3 rounded-lg font-bold hover:bg-[#239960] transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

// Driver App Section Editor
const DriverAppSectionEditor = ({ data, onSave, saving }) => {
    const [formData, setFormData] = useState({
        badge: '',
        heading: '',
        description: '',
        playStoreLink: '',
        appImages: []
    });

    useEffect(() => {
        if (data) {
            setFormData(data);
        }
    }, [data]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.appImages];
        newImages[index] = value;
        setFormData({ ...formData, appImages: newImages });
    };

    const addImage = () => {
        setFormData({ ...formData, appImages: [...formData.appImages, ''] });
    };

    const removeImage = (index) => {
        const newImages = formData.appImages.filter((_, i) => i !== index);
        setFormData({ ...formData, appImages: newImages });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Driver App Section</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                        <input
                            type="text"
                            name="badge"
                            value={formData.badge}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                            placeholder="e.g., For Drivers"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
                        <input
                            type="text"
                            name="heading"
                            value={formData.heading}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Play Store Link</label>
                    <input
                        type="url"
                        name="playStoreLink"
                        value={formData.playStoreLink}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">App Images</label>
                        <button
                            type="button"
                            onClick={addImage}
                            className="text-sm bg-[#2BB673] text-white px-3 py-1 rounded-lg hover:bg-[#239960]"
                        >
                            + Add Image
                        </button>
                    </div>
                    <div className="space-y-2">
                        {formData.appImages?.map((image, index) => (
                            <div key={index} className="flex gap-2">
                                <ImageUploader
                                    value={image}
                                    onChange={(url) => handleImageChange(index, url)}
                                    placeholder="Image URL"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="text-red-600 hover:text-red-800 px-3"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#2BB673] text-white py-3 rounded-lg font-bold hover:bg-[#239960] transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

// Cities Section Editor
const CitiesSectionEditor = ({ data, onSave, saving }) => {
    const [formData, setFormData] = useState({
        heading: '',
        description: '',
        cities: []
    });

    useEffect(() => {
        if (data) {
            setFormData(data);
        }
    }, [data]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCityChange = (index, value) => {
        const newCities = [...formData.cities];
        const current = newCities[index];
        const image = (current && typeof current === 'object') ? current.image : '';
        newCities[index] = { name: value, image };
        setFormData({ ...formData, cities: newCities });
    };

    const addCity = () => {
        setFormData({ ...formData, cities: [...formData.cities, { name: '', image: '' }] });
    };

    const removeCity = (index) => {
        const newCities = formData.cities.filter((_, i) => i !== index);
        setFormData({ ...formData, cities: newCities });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Cities Section</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
                    <input
                        type="text"
                        name="heading"
                        value={formData.heading}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent resize-none"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">Cities</label>
                        <button
                            type="button"
                            onClick={addCity}
                            className="text-sm bg-[#2BB673] text-white px-3 py-1 rounded-lg hover:bg-[#239960]"
                        >
                            + Add City
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {formData.cities?.map((city, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={typeof city === 'string' ? city : city.name || ''}
                                    onChange={(e) => handleCityChange(index, e.target.value)}
                                    placeholder="City name"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeCity(index)}
                                    className="text-red-600 hover:text-red-800 px-3"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#2BB673] text-white py-3 rounded-lg font-bold hover:bg-[#239960] transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

// Testimonials Section Editor
const TestimonialsSectionEditor = ({ data, onSave, saving }) => {
    const [formData, setFormData] = useState({
        heading: '',
        testimonials: []
    });

    useEffect(() => {
        if (data) {
            setFormData(data);
        }
    }, [data]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTestimonialChange = (index, field, value) => {
        const newTestimonials = [...formData.testimonials];
        newTestimonials[index][field] = value;
        setFormData({ ...formData, testimonials: newTestimonials });
    };

    const addTestimonial = () => {
        setFormData({
            ...formData,
            testimonials: [...formData.testimonials, { name: '', role: '', text: '', avatar: '' }]
        });
    };

    const removeTestimonial = (index) => {
        const newTestimonials = formData.testimonials.filter((_, i) => i !== index);
        setFormData({ ...formData, testimonials: newTestimonials });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Testimonials Section</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
                    <input
                        type="text"
                        name="heading"
                        value={formData.heading}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">Testimonials</label>
                        <button
                            type="button"
                            onClick={addTestimonial}
                            className="text-sm bg-[#2BB673] text-white px-3 py-1 rounded-lg hover:bg-[#239960]"
                        >
                            + Add Testimonial
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.testimonials?.map((testimonial, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-medium text-gray-900">Testimonial {index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeTestimonial(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={testimonial.name}
                                        onChange={(e) => handleTestimonialChange(index, 'name', e.target.value)}
                                        placeholder="Name"
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        value={testimonial.role}
                                        onChange={(e) => handleTestimonialChange(index, 'role', e.target.value)}
                                        placeholder="Role"
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <textarea
                                    value={testimonial.text}
                                    onChange={(e) => handleTestimonialChange(index, 'text', e.target.value)}
                                    placeholder="Testimonial text"
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 resize-none"
                                />
                                <input
                                    type="text"
                                    value={testimonial.avatar}
                                    onChange={(e) => handleTestimonialChange(index, 'avatar', e.target.value)}
                                    placeholder="Avatar URL (optional)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#2BB673] text-white py-3 rounded-lg font-bold hover:bg-[#239960] transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

// FAQ Section Editor
const FAQSectionEditor = ({ data, onSave, saving }) => {
    const [formData, setFormData] = useState({
        heading: '',
        faqs: []
    });

    useEffect(() => {
        if (data) {
            setFormData(data);
        }
    }, [data]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFAQChange = (index, field, value) => {
        const newFAQs = [...formData.faqs];
        newFAQs[index][field] = value;
        setFormData({ ...formData, faqs: newFAQs });
    };

    const addFAQ = () => {
        setFormData({
            ...formData,
            faqs: [...formData.faqs, { question: '', answer: '' }]
        });
    };

    const removeFAQ = (index) => {
        const newFAQs = formData.faqs.filter((_, i) => i !== index);
        setFormData({ ...formData, faqs: newFAQs });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">FAQ Section</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
                    <input
                        type="text"
                        name="heading"
                        value={formData.heading}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">FAQs</label>
                        <button
                            type="button"
                            onClick={addFAQ}
                            className="text-sm bg-[#2BB673] text-white px-3 py-1 rounded-lg hover:bg-[#239960]"
                        >
                            + Add FAQ
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.faqs?.map((faq, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-medium text-gray-900">FAQ {index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeFAQ(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={faq.question}
                                    onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                                    placeholder="Question"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                                />
                                <textarea
                                    value={faq.answer}
                                    onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                                    placeholder="Answer"
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#2BB673] text-white py-3 rounded-lg font-bold hover:bg-[#239960] transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

// Legal Content Editor (Privacy, Terms, About)
const LegalContentEditor = ({ type, title, defaultTitle }) => {
    const [contentData, setContentData] = useState({
        title: '',
        content: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchContent();
    }, [type]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/content/${type}?appType=user`);
            if (response.data.success) {
                setContentData({
                    title: response.data.data.content.title,
                    content: response.data.data.content.content
                });
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Not found, use defaults if available
                setContentData({
                    title: defaultTitle || title,
                    content: ''
                });
            } else {
                console.error('Error fetching content:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/content`,
                {
                    type: type,
                    appType: 'user',
                    title: contentData.title,
                    content: contentData.content
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Content updated successfully!' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (error) {
            console.error('Error saving content:', error);
            setMessage({ type: 'error', text: 'Failed to save content' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{title}</h2>

            {message.text && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Title
                    </label>
                    <input
                        type="text"
                        value={contentData.title}
                        onChange={(e) => setContentData({ ...contentData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent"
                        placeholder={`Enter ${title} title`}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content (HTML/Text)
                    </label>
                    <textarea
                        value={contentData.content}
                        onChange={(e) => setContentData({ ...contentData, content: e.target.value })}
                        rows={15}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BB673] focus:border-transparent font-mono text-sm"
                        placeholder="Enter content here..."
                        required
                    />
                    <p className="mt-2 text-xs text-gray-500">
                        Supports basic text. Use double newlines for paragraphs. HTML tags are also supported for advanced formatting.
                    </p>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-[#2BB673] text-white rounded-lg hover:bg-[#249c62] transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};


// Services Page Editor
const ServicesPageEditor = () => {
    const [formData, setFormData] = useState({
        hero: {
            subBadge: 'Our Services',
            title: 'Professional Driving Solutions For Every Need',
            description: "Experience safe, reliable, and comfortable journeys with our verified drivers...",
            features: ['Verified Drivers', '24/7 Available', 'Affordable Rates', 'Safe Journey']
        },
        services: [
            { title: 'Hourly Driver', description: 'Perfect for short errands...', icon: 'clock' },
            { title: 'Outstation Trip', description: 'Plan your weekend getaways...', icon: 'map' },
            { title: 'Daily Commute', description: 'Hassle-free daily rides...', icon: 'briefcase' }
        ]
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/content/services-page?appType=user`);
            if (response.data.success) {
                // Parse JSON content if it's a string, otherwise use defaults
                let parsedContent = {};
                try {
                    parsedContent = JSON.parse(response.data.data.content.content);
                } catch (e) {
                    // console.error("Error parsing content JSON", e);
                }
                setFormData(prev => ({ ...prev, ...parsedContent }));
            }
        } catch (error) {
            // console.error('Error fetching services content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/content`,
                {
                    type: 'services-page',
                    appType: 'user',
                    title: 'Services Page Content', // Fixed title for internal use
                    content: JSON.stringify(formData) // Store complex object as string
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Services page updated successfully!' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (error) {
            console.error('Error saving content:', error);
            setMessage({ type: 'error', text: 'Failed to save content' });
        } finally {
            setSaving(false);
        }
    };

    const handleHeroChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            hero: { ...prev.hero, [field]: value }
        }));
    };

    const handleServiceChange = (index, field, value) => {
        const newServices = [...formData.services];
        newServices[index][field] = value;
        setFormData(prev => ({ ...prev, services: newServices }));
    };

    const addService = () => {
        setFormData(prev => ({
            ...prev,
            services: [...prev.services, { title: '', description: '', icon: '' }]
        }));
    };

    const removeService = (index) => {
        const newServices = formData.services.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, services: newServices }));
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Services Page Editor</h2>
            {message.text && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                </div>
            )}
            <form onSubmit={handleSave} className="space-y-8">
                {/* Hero Section */}
                <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">Hero Section</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub Badge</label>
                            <input
                                type="text"
                                value={formData.hero.subBadge}
                                onChange={(e) => handleHeroChange('subBadge', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={formData.hero.title}
                                onChange={(e) => handleHeroChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={formData.hero.description}
                                onChange={(e) => handleHeroChange('description', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Services Cards */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Service Cards</h3>
                        <button
                            type="button"
                            onClick={addService}
                            className="bg-[#2BB673] text-white px-3 py-1 rounded hover:bg-[#239960] text-sm"
                        >
                            + Add Service
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.services.map((service, index) => (
                            <div key={index} className="border p-4 rounded-lg relative bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => removeService(index)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                >
                                    ✕
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">Title</label>
                                        <input
                                            type="text"
                                            value={service.title}
                                            onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">Icon (SVG/Name)</label>
                                        <input
                                            type="text"
                                            value={service.icon}
                                            onChange={(e) => handleServiceChange(index, 'icon', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500">Description</label>
                                        <textarea
                                            value={service.description}
                                            onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-[#2BB673] text-white rounded-lg hover:bg-[#249c62] font-medium"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Contact Page Editor
const ContactPageEditor = () => {
    const [formData, setFormData] = useState({
        hero: {
            title: 'Contact Us',
            subtitle: "We're here to help! Reach out to us for any questions or support."
        },
        info: {
            introTitle: 'Get in Touch',
            introText: "Whether you're looking for a driver, interested in partnering with us...",
            visit: { title: 'Visit Us', text: '123 Driver Lane, Transport City, India' },
            email: { title: 'Email Us', text: 'support@searchmydriver.com' },
            call: { title: 'Call Us', text: '+91 123 456 7890' }
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/content/contact-page?appType=user`);
            if (response.data.success) {
                let parsedContent = {};
                try {
                    parsedContent = JSON.parse(response.data.data.content.content);
                } catch (e) { console.error(e); }
                setFormData(prev => ({ ...prev, ...parsedContent }));
            }
        } catch (error) {
            // console.error('Error fetching contact content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/content`,
                {
                    type: 'contact-page',
                    appType: 'user',
                    title: 'Contact Page Content',
                    content: JSON.stringify(formData)
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Contact page updated successfully!' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (error) {
            console.error('Error saving content:', error);
            setMessage({ type: 'error', text: 'Failed to save content' });
        } finally {
            setSaving(false);
        }
    };

    const handleHeroChange = (field, value) => {
        setFormData(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
    };

    const handleInfoChange = (section, field, value) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                info: { ...prev.info, [section]: { ...prev.info[section], [field]: value } }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                info: { ...prev.info, [field]: value }
            }));
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Page Editor</h2>
            {message.text && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                </div>
            )}
            <form onSubmit={handleSave} className="space-y-8">
                {/* Hero Section */}
                <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">Hero Section</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={formData.hero.title}
                                onChange={(e) => handleHeroChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                            <input
                                type="text"
                                value={formData.hero.subtitle}
                                onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Intro Title</label>
                            <input
                                type="text"
                                value={formData.info.introTitle}
                                onChange={(e) => handleInfoChange(null, 'introTitle', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Intro Text</label>
                            <textarea
                                value={formData.info.introText}
                                onChange={(e) => handleInfoChange(null, 'introText', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            {/* Visit */}
                            <div className="border p-3 rounded">
                                <h4 className="font-medium mb-2 text-sm text-[#2BB673]">Visit Us</h4>
                                <input
                                    type="text"
                                    value={formData.info.visit.title}
                                    onChange={(e) => handleInfoChange('visit', 'title', e.target.value)}
                                    placeholder="Title"
                                    className="w-full px-2 py-1 border rounded mb-2 text-sm"
                                />
                                <input
                                    type="text"
                                    value={formData.info.visit.text}
                                    onChange={(e) => handleInfoChange('visit', 'text', e.target.value)}
                                    placeholder="Address"
                                    className="w-full px-2 py-1 border rounded text-sm"
                                />
                            </div>
                            {/* Email */}
                            <div className="border p-3 rounded">
                                <h4 className="font-medium mb-2 text-sm text-[#2BB673]">Email Us</h4>
                                <input
                                    type="text"
                                    value={formData.info.email.title}
                                    onChange={(e) => handleInfoChange('email', 'title', e.target.value)}
                                    placeholder="Title"
                                    className="w-full px-2 py-1 border rounded mb-2 text-sm"
                                />
                                <input
                                    type="text"
                                    value={formData.info.email.text}
                                    onChange={(e) => handleInfoChange('email', 'text', e.target.value)}
                                    placeholder="Email Address"
                                    className="w-full px-2 py-1 border rounded text-sm"
                                />
                            </div>
                            {/* Call */}
                            <div className="border p-3 rounded">
                                <h4 className="font-medium mb-2 text-sm text-[#2BB673]">Call Us</h4>
                                <input
                                    type="text"
                                    value={formData.info.call.title}
                                    onChange={(e) => handleInfoChange('call', 'title', e.target.value)}
                                    placeholder="Title"
                                    className="w-full px-2 py-1 border rounded mb-2 text-sm"
                                />
                                <input
                                    type="text"
                                    value={formData.info.call.text}
                                    onChange={(e) => handleInfoChange('call', 'text', e.target.value)}
                                    placeholder="Phone Number"
                                    className="w-full px-2 py-1 border rounded text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-[#2BB673] text-white rounded-lg hover:bg-[#249c62] font-medium"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Image Uploader Component
const ImageUploader = ({ value, onChange, placeholder }) => {
    const [uploading, setUploading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post(`${API_URL}/upload/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                onChange(response.data.url);
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed. Check console for details.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex gap-2 items-center w-full">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || "Image URL"}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <label className={`cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg border border-gray-300 flex items-center justify-center transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <span className="text-gray-600">Upload</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            </label>
        </div>
    );
};

export default LandingPageManager;
