'use client'

import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { metadata } from './metadata' 
import LoadingSpinner from "@/components/ui/LoadingSpinner";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

function LayoutWrapper({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter()
  
  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect( ()=> {
    // if (!loading) {
    //   if (!user && !isPublicRoute) {
    //     router.push('/login')
    //   } else if (user && isPublicRoute) {
        router.push('/dashboard')
    //   }
    // }
  // }, [user,loading,isPublicRoute, router]
  }, [router]
)
  
  if (loading) {
    return <LoadingSpinner /> // Add a proper loading spinner here
  }

  // Show only children (no sidebar/header) for public routes
  if (isPublicRoute) {
    return children;
  }

  // Show full layout with sidebar for authenticated routes
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
       <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="viewport" content={metadata.viewport} />
        </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}