// import { jwtVerify, SignJWT } from 'jose'

// export async function verifyAuth(token) {
//     // if (!token) {
//     //     throw new Error('Missing token')
//     // }

//     try {
//         const verified = await jwtVerify(
//             token,
//             new TextEncoder().encode(process.env.JWT_SECRET)
//         )

//         // Check if token is expired
//         const currentTime = Math.floor(Date.now() / 1000)
//         if (verified.payload.exp && verified.payload.exp < currentTime) {
//             throw new Error('Token has expired')
//         }

//         return verified.payload
//     } catch (error) {
//         throw new Error(error.message || 'Invalid token')
//     }
// }

// export async function createToken(payload) {
//     try {
//         const token = await new SignJWT(payload)
//             .setProtectedHeader({ alg: 'HS256' })
//             .setIssuedAt()
//             .setExpirationTime('24h') // Token expires in 24 hours
//             .sign(new TextEncoder().encode(process.env.JWT_SECRET))
        
//         return token
//     } catch (error) {
//         throw new Error('Error creating token')
//     }
// }

// export function setTokenCookie(res, token) {
//     res.setHeader(
//         'Set-Cookie',
//         `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24}` // 24 hours
//     )
// }

// export function clearTokenCookie(res) {
//     res.setHeader(
//         'Set-Cookie',
//         'token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
//     )
// }

