import Link from 'next/link'
import { Home, Users, FolderOpen, Calendar, FileText, BarChart2 } from 'lucide-react'



export default function Sidebar() {
    
  return (
    <div className="bg-gray-900 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out font-sans">
      <Link href="/" className="flex items-center space-x-2 px-4">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#8B5CF6" />
          <path d="M2 17L12 22L22 17" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 12L12 17L22 12" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-geist-sans)' }}>DP Project</span>
      </Link>
      <nav>
        <Link href="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
          <Home className="inline-block mr-2" size={20} />
          <span style={{ fontFamily: 'var(--font-geist-sans)' }}>Dashboard</span>
        </Link>
        <Link href="/team" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
          <Users className="inline-block mr-2" size={20} />
          <span style={{ fontFamily: 'var(--font-geist-sans)' }}>Team</span>
        </Link>
        <Link href="/projects" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
          <FolderOpen className="inline-block mr-2" size={20} />
          <span style={{ fontFamily: 'var(--font-geist-sans)' }}>Projects</span>
        </Link>
        <Link href="/calendar" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
          <Calendar className="inline-block mr-2" size={20} />
          <span style={{ fontFamily: 'var(--font-geist-sans)' }}>Calendar</span>
        </Link>
        <Link href="/documents" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
          <FileText className="inline-block mr-2" size={20} />
          <span style={{ fontFamily: 'var(--font-geist-sans)' }}>Documents</span>
        </Link>
        <Link href="/reports" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
          <BarChart2 className="inline-block mr-2" size={20} />
          <span style={{ fontFamily: 'var(--font-geist-sans)' }}>Reports</span>
        </Link>
      </nav>
      {/* <div className="px-4 mt-6">
        <h2 className="text-xl" style={{ fontFamily: 'var(--font-geist-sans)' }}>Your teams</h2>
        <div className="mt-2 flex items-center space-x-2">
          <div className="bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center">
            <span style={{ fontFamily: 'var(--font-geist-mono)' }}>S</span>
          </div>
          <span style={{ fontFamily: 'var(--font-geist-sans)' }}>Sales</span>
        </div>
      </div> */}
    </div>
  )
}