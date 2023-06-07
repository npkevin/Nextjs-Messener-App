/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  serverRuntimeConfig: {
    socketio: "52.87.192.66",
    saltWorkFactor: 10,
    jwt_secret: "shhh...dOn'tTellAnyone!",
  },
  publicRuntimeConfig: {},

}

export default nextConfig
