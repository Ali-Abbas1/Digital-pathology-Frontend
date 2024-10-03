import { Bell, ChevronDown } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="w-full max-w-xl">
          <input
            className="w-full px-4 py-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600 transition duration-200"
            type="search"
            placeholder="Search..."
            style={{ fontFamily: 'var(--font-geist-sans)' }}
          />
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700">
            <Bell size={20} />
          </button>
          <div className="flex items-center space-x-2">
            <img
              className="h-8 w-8 rounded-full"
              src="/placeholder.svg?height=32&width=32"
              alt="User avatar"
            />
            <span className="font-medium text-gray-700" style={{ fontFamily: 'var(--font-geist-sans)' }}>Oliver Martin</span>
            <ChevronDown size={20} className="text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  )
}