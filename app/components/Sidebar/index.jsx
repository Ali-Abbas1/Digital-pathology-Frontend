'use client'

import Link from 'next/link'
import { Home, Users, FolderOpen, Calendar, FileText, BarChart2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePathname } from 'next/navigation'
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from '@/lib/utils'

export default function SidebarComponent() {
    const { logout } = useAuth();
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
    ];
    
    return (
        <Sidebar>
            <SidebarBody>
                {/* Navigation */}
                <nav className="flex-1 space-y-3">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <SidebarLink
                                key={item.name}
                                link={{
                                    href: item.href,
                                    label: item.name,
                                    icon: <item.icon className="inline-block mr-2" size={20} />
                                }}
                                className={`block py-2.5 px-4 rounded transition duration-200 ${
                                    isActive 
                                        ? 'bg-dashboard-sidebar-hover text-white' 
                                        : 'hover:bg-dashboard-sidebar-hover hover:text-white'
                                }`}
                            />
                        );
                    })}
                </nav>
            </SidebarBody>
        </Sidebar>
    )
}