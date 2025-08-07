'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';

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
import Header from '../components/Header';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Slides', href: '/dashboard/slides', icon: FileText },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // useEffect(() => {
  //   const token = Cookies.get('token');
  //   if (!token) {
  //     router.push('/login');
  //   }
  // }, [router]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  // User dropdown menu items
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar code remains the same */}
      
      {/* Main content */}
    
        <main className="p-8">
          {children}
        </main>
      
    </div>
  );
}