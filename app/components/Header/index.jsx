'use client'

import { useAuth } from '@/hooks/useAuth'
import { 
  Home,
  FileText,
  Menu,
  Bell,
  UserCircle,
  LogOut,
  Settings,
  ChevronDown,
  User,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';



export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);


  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // useEffect(() => {
  //   const token = Cookies.get('token');
  //   if (!token) {
  //     router.push('/login');
  //   }
  // }, [router]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  
  const userMenuItems = [
    {
      label: 'My Profile',
      icon: User,
      onClick: () => {
        router.push('/dashboard/profile');
        setDropdownOpen(false);
      }
    },
    {
      label: 'Settings',
      icon: Settings,
      onClick: () => {
        router.push('/dashboard/settings');
        setDropdownOpen(false);
      }
    },
    {
      label: 'Help & Support',
      icon: HelpCircle,
      onClick: () => {
        router.push('/dashboard/support');
        setDropdownOpen(false);
      }
    },
    {
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogout,
      className: 'text-red-600 hover:text-red-700 hover:bg-red-50'
    }
  ];

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Slides', href: '/dashboard/slides', icon: FileText },
  ];


  return (
    <nav className="bg-white shadow-sm">
      <div className=" px-4 sm:px-6 lg:px-8">
      <div className="flex justify-end h-16 px-8">
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <Bell className="w-6 h-6" />
              </button>
              
              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-700">
                      {user?.name || user?.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.role || 'User'}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                    {userMenuItems.map((item, index) => (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${item.className || ''}`}
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>
    </nav>
  )
}