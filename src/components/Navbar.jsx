import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileCheck2, 
  PlusCircle, 
  ClipboardList, 
  AlertTriangle, 
  Settings, 
  Smartphone, 
  Menu, 
  X,
  Send
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'TechHarmonix',
    logoUrl: 'https://www.techharmonix.com/_next/image?url=%2Fimages%2Flogo%2FLogo.png&w=256&q=75'
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.companyName) setSettings(data);
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Templates', path: '/templates', icon: FileCheck2 },
    { name: 'New Audit', path: '/inspections/new', icon: PlusCircle, highlight: true },
    { name: 'History', path: '/inspections', icon: ClipboardList },
    { name: 'Issues', path: '/issues', icon: AlertTriangle },
    { name: 'Mobile APK', path: '/apk', icon: Smartphone },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100 group-hover:scale-105 transition-transform">
              <img 
                src={settings.logoUrl || "https://www.techharmonix.com/_next/image?url=%2Fimages%2Flogo%2FLogo.png&w=256&q=75"} 
                alt="Company Logo" 
                className="h-8 w-auto object-contain min-w-[32px]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://www.techharmonix.com/_next/image?url=%2Fimages%2Flogo%2FLogo.png&w=256&q=75";
                }}
              />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
                {settings.companyName} <span className="text-blue-600 font-extrabold text-xs uppercase px-2 py-0.5 bg-blue-50 rounded-full border border-blue-200">DigiCheck</span>
              </span>
              <span className="block text-[10px] font-medium text-gray-500 tracking-wider">Digital Office Inspection Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);

              if (link.highlight) {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="ml-2 inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all hover:shadow transform active:scale-95"
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    {link.name}
                  </Link>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'text-blue-700 bg-blue-50 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-1.5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg text-base font-medium ${
                  link.highlight
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : active
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${link.highlight ? 'text-white' : active ? 'text-blue-600' : 'text-gray-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
