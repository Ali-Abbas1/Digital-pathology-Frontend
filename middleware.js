import { NextResponse } from "next/server";
import { verifyAuth } from "./lib/auth";

export async function middleware(request) {
    const path = request.nextUrl.pathname
    // const token = request.cookies.get('token')
    // console.log('Verifying token:', token); // Log the token

    // Public routes (login and signup)
    // if (path.startsWith('/login') || path.startsWith('/signup')) {
    //     if (token) {
    //         try {
    //             await verifyAuth(token.value)
    //             console.log('Token is valid, redirecting to dashboard');
    //             return NextResponse.redirect(new URL('/dashboard', request.url))
    //         } catch (error) {
    //             console.error('Token verification failed:', error);
    //             const response = NextResponse.next()
    //             response.cookies.delete('token')
    //             return response
    //         }
    //     }
    //     return NextResponse.next()
    // }

    // Redirect root to dashboard if authenticated, otherwise to login
    // if (path === '/') {
    //     if (token) {
    //         try {
    //             await verifyAuth(token.value)
    //             console.log('Token is valid, redirecting to dashboard');
    //             return NextResponse.redirect(new URL('/dashboard', request.url))
    //         } catch (error) {
    //             console.error('Token verification failed:', error);
    //             return NextResponse.redirect(new URL('/login', request.url))
    //         }
    //     }
    //     return NextResponse.redirect(new URL('/login', request.url))
    // }

    // Protected routes
    // if (path.startsWith('/dashboard')) {
    //     if (!token) {
    //         console.log('No token found, redirecting to login');
    //         return NextResponse.redirect(new URL('/login', request.url))
    //     }

    //     try {
    //         await verifyAuth(token.value)
    //         console.log('Token is valid, proceeding to dashboard');
    //         return NextResponse.next()
    //     } catch (error) {
    //         console.error('Token verification failed:', error);
    //         const response = NextResponse.redirect(new URL('/login', request.url))
    //         response.cookies.delete('token')
    //         return response
    //     }
    // }

    return NextResponse.next()
}

// export const config = {
//     matcher: [
//         '/',
//         '/login',
//         '/signup',
//         '/dashboard/:path*'
//     ]
// }