import { Link, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import Logo from '../../assets/SearchMyDriver.png';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';

const Sidebar = ({ isOpen, onClose, collapsed, toggleSidebar }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const navRef = useRef(null);

  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const isSubAdmin = adminData.adminType === 'subadmin';

  // Restore scroll position on mount
  useLayoutEffect(() => {
    if (navRef.current) {
      const savedScroll = sessionStorage.getItem('sidebarScrollTop');
      if (savedScroll) {
        navRef.current.scrollTop = parseInt(savedScroll, 10);
      }
    }
  }, []);

  // Save scroll position on scroll
  const handleScroll = (e) => {
    sessionStorage.setItem('sidebarScrollTop', e.target.scrollTop);
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', section: 'main' },
    { path: '/users', label: 'Users', icon: 'people', section: 'main' },
    // { path: '/referrals', label: 'Referrals', icon: 'share', section: 'main' }, // REMOVED

    { path: '/drivers', label: 'Drivers', icon: 'local_taxi', section: 'main' },
    { path: '/driver-referrals', label: 'Driver Referrals', icon: 'volunteer_activism', section: 'main' }, // Keeping distinct icon
    { path: '/trip-bookings', label: 'Bookings', icon: 'route', section: 'main' },
    { path: '/transactions', label: 'Transactions', icon: 'receipt_long', section: 'main' },
    { path: '/hiring-requests', label: 'Monthly Hiring', icon: 'work', section: 'main' },

    // Global Management - Hidden for Sub-Admins
    ...(isSubAdmin ? [] : [
      { path: '/zones', label: 'Service Zones', icon: 'map', section: 'management' },
      { path: '/content', label: 'Content', icon: 'description', section: 'management' },
      { path: '/banners', label: 'Banners', icon: 'image', section: 'management' },
    ]),

    { path: '/incomplete-registrations', label: 'Incomplete Reg.', icon: 'pending_actions', section: 'management' },
    { path: '/driver-wallet-transactions', label: 'Driver Wallet', icon: 'account_balance_wallet', section: 'management' },
    { path: '/notifications', label: 'Notifications', icon: 'notifications', section: 'management' },
    { path: '/tickets', label: 'Support Tickets', icon: 'support_agent', section: 'management' },
    { path: '/admin-profile', label: 'Profile', icon: 'account_circle', section: 'settings' },

    // Settings - Hidden for Sub-Admins
    ...(isSubAdmin ? [] : [
      { path: '/fare', label: 'Fare Setup', icon: 'payments', section: 'management' },
      { path: '/subadmins', label: 'Sub-Admins', icon: 'admin_panel_settings', section: 'settings' },
    ]),
  ];

  const isActive = (path) => {
    if (path === '/drivers') {
      return location.pathname.startsWith('/drivers') &&
        !location.pathname.includes('/drivers/pending') &&
        !location.pathname.includes('/drivers/verified') &&
        !location.pathname.includes('/drivers/rejected');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      authService.logout();
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const groupedMenuItems = {
    main: menuItems.filter(item => item.section === 'main'),
    management: menuItems.filter(item => item.section === 'management'),
    settings: menuItems.filter(item => item.section === 'settings'),
  };

  const renderSectionHeader = (title) => (
    <div
      className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${collapsed ? 'h-0 opacity-0 mb-0' : 'h-4 opacity-100 mb-1'}
        `}
    >
      <p className="px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
        {title}
      </p>
    </div>
  );

  const renderMenuItem = (item) => {
    const active = isActive(item.path);
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={handleLinkClick}
        onMouseEnter={() => setHoveredItem(item.path)}
        onMouseLeave={() => setHoveredItem(null)}
        className={`
          relative flex items-center py-2.5 rounded-lg transition-all duration-300 group mb-0.5 overflow-hidden whitespace-nowrap box-border
          ${active
            ? 'bg-gradient-to-r from-[#2BB673] to-[#239960] text-white shadow-md shadow-green-900/20'
            : 'text-gray-400 hover:bg-[#123E6B] hover:text-white'
          }
           ${collapsed ? 'justify-center px-0' : 'px-3 pl-5'}
        `}
      >
        <span className={`material-icons-outlined text-lg transition-all duration-300 flex-shrink-0 ${active ? '' : 'group-hover:scale-110'} ${!collapsed && 'mr-3'}`}>
          {item.icon}
        </span>

        <span className={`
          font-medium tracking-wide text-[13px] transition-all duration-300 ease-in-out origin-left
          ${collapsed ? 'w-0 opacity-0 scale-95 hidden' : 'w-auto opacity-100 scale-100'}
        `}>
          {item.label}
        </span>

        {collapsed && hoveredItem === item.path && (
          <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#091E3A] text-white text-xs font-semibold rounded-md shadow-xl border border-white/10 z-50 whitespace-nowrap pointer-events-none animate-slide-in">
            {item.label}
            {/* Arrow */}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#091E3A] rotate-45 border-l border-b border-white/10"></div>
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
      )}

      <div
        id="sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 bg-[#0B2C4D] border-r border-[#123E6B] shadow-2xl
          transform transition-all duration-300 ease-in-out
          lg:sticky lg:top-0 lg:h-screen lg:z-auto lg:shadow-none lg:shrink-0 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'w-20' : 'w-64'}
          flex flex-col overflow-x-hidden
        `}
      >
        {/* Logo Section */}
        <div className={`h-16 flex items-center border-b border-white/5 bg-[#0B2C4D] shrink-0 relative group touch-none transition-all duration-300 ${collapsed ? 'justify-center px-0' : 'pl-5'}`}>
          <Link to="/dashboard" className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3 w-full'} overflow-hidden`}>
            <div className="relative flex-shrink-0 flex items-center justify-center">
              <img
                src={Logo}
                alt="Search My Driver"
                className={`transition-all duration-300 object-contain brightness-0 invert ${collapsed ? 'h-10 w-10' : 'h-8 w-8'}`}
              />
            </div>

            <div className={`flex flex-col justify-center whitespace-nowrap transition-all duration-300 ease-in-out origin-left ${collapsed ? 'w-0 opacity-0 scale-95 hidden' : 'w-auto opacity-100 scale-100'}`}>
              <span className="text-lg font-bold text-white leading-none tracking-wide group-hover:text-[#2BB673] transition-colors mb-0.5">
                SearchMy
              </span>
              <span className="text-xs font-semibold text-gray-400 tracking-wider leading-none">
                Driver
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav
          ref={navRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 sidebar-scrollbar space-y-2"
        >

          {/* Main Section */}
          <div className="flex flex-col">
            {renderSectionHeader('Main Menu')}
            <div className="space-y-0.5">
              {groupedMenuItems.main.map(renderMenuItem)}
            </div>
          </div>

          {/* Management Section */}
          <div className="flex flex-col">
            {renderSectionHeader('Management')}
            <div className="space-y-0.5">
              {groupedMenuItems.management.map(renderMenuItem)}
            </div>
          </div>

          {/* Settings Section */}
          <div className="flex flex-col">
            {renderSectionHeader('Settings')}
            <div className="space-y-0.5">
              {groupedMenuItems.settings.map(renderMenuItem)}
            </div>
          </div>

        </nav>

        {/* User Profile / Logout Section */}
        <div className="p-2 border-t border-white/5 bg-[#09223b] shrink-0">
          <button
            onClick={handleLogout}
            className={`
              flex items-center w-full py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-red-500/10 transition-all duration-300 group border border-transparent hover:border-red-500/20 overflow-hidden whitespace-nowrap
               ${collapsed ? 'justify-center px-0' : 'pl-5'}
            `}
            title="Logout"
          >
            <span className="material-icons-outlined group-hover:text-red-500 transition-colors text-lg flex-shrink-0 mr-3">
              logout
            </span>
            <span className={`font-medium text-sm transition-all duration-300 ease-in-out origin-left ${collapsed ? 'w-0 opacity-0 scale-95 hidden' : 'w-auto opacity-100 scale-100'}`}>
              Logout Account
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
