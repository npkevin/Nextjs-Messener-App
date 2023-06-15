/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    saltWorkFactor: 10,
    jwt_secret: "shhh...dOn'tTellAnyone!",
    MONGODB_URI: "mongodb://127.0.0.1:27017/", // process.env.MONGODB_URI || 
  },
  publicRuntimeConfig: {
    SOCKETIO_URI: "https://webdev.kevnp.com", // process.env.SOCKETIO_URI || 
  },
}

export default nextConfig
