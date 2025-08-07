import Link from 'next/link'
import { Home, Users, FolderOpen, Calendar, FileText, BarChart2 } from 'lucide-react'
import Logo from '../Logo'
import { SidebarRoutes } from '../SidebarRoutes'

export default function Sidebar({label, href, Icon, isActive}) {
  return (
      <nav>
        <Link href="/" className="flex items-center space-x-2 px-4">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#8B5CF6" />
          <path d="M2 17L12 22L22 17" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 12L12 17L22 12" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-geist-sans)' }}>DP Project</span>
      </Link>
        <Link href={href} className={`${isActive ? 'active block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white' : 'block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white' }`}>
          <Home className="inline-block mr-2" size={20} />
          <span style={{ fontFamily: 'var(--font-geist-sans)' }}>{label}</span>
        </Link>
        
      </nav>
  )
}