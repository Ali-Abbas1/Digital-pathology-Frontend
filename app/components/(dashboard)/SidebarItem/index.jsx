"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../Sidebar";


export const SidebarItem = ({ Icon, label, href }) => {
    
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (pathname === "/" && href === "/") || pathname === href || pathname?.startsWith(`${href}/`);   

    const handleClick = () => {
        router.push(href)
    }
    return (
        <div role="button"
        onClick={handleClick}
        className={cn(
            "flex items-center gap-x-2 text-slate-500 text-sm font-medium pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
             isActive && "text-sky-700 bg-sky-200/20 hover:bg-sky-200/20"
        )}>
            <Sidebar label={label} href={href} Icon={Icon} isActive={isActive}/>
        </div>
    )
}