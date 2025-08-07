"use client"

import { Home, Users, FolderOpen, Calendar, FileText, BarChart2 } from 'lucide-react'
import { SidebarItem } from "../SidebarItem";

const guestRoutes = [
    {
        icon: Home,
        label: "Dashboard",
        href: "/",
    },
    {
        icon: Users,
        label: "Teams",
        href: "/team",
    },
    {
        icon: FolderOpen,
        label: "projects",
        href: "/projects",
    },
    {
        icon: FileText,
        label: "documents",
        href: "/documents",
    },
]

export const SidebarRoutes = () => {
    const routes = guestRoutes; 

    return (
        <div className="flex flex-col w-full">
            {routes.map((route)=> (
                <SidebarItem
                key={route.href}
                icon={route.icon}
                label={route.label}
                href={route.href}
                />
            ))}
        </div>
    )
}