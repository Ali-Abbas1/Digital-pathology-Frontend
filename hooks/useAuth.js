'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://203.241.228.97:8080'

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        try {
            // const token = Cookies.get('token')
            // if (!token) {
            //     setLoading(false)
            //     return
            // }

            const res = await fetch(`${apiUrl}/api/auth/user`, {
                headers: {
                    // 'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const data = await res.json()

            if (data.status === 'success') {
                setUser(data.user)
                
                console.log('User logged in:', data.user);
            } else {
                // Cookies.remove('token')
                setUser(null)
            }
        } catch (error) {
            console.error('Error checking user:', error)
            // Cookies.remove('token')
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        try {
            const res = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' 
                },
                body: JSON.stringify({ email, password }),
            })
            
            console.log('Login response status:', res.status);
            console.log('Login response headers:', res.headers);

            const data = await res.json()
            console.log('Login response:', data);

            if (data.status !== 'success') {
                console.error('Login failed:', data.message || 'Unknown error');
                throw new Error(data.message || 'Login failed')
            }

            setUser(data.user)
            console.log('User state set:', data.user); // Debug log
            // Cookies.set('token', data.token, { expires: 1 }) // 1 day expiry
            console.log('Redirecting to dashboard...');
            router.push('/dashboard')
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    }

    const logout = async () => {
        try {
            // const token = Cookies.get('token')
            await fetch(`${apiUrl}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    // 'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            // Cookies.remove('token')
            setUser(null)
            router.push('/login')
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}