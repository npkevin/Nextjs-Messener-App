/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  serverRuntimeConfig: {
    socketio: "54.197.13.132",
    saltWorkFactor: 10,
    jwt_secret: "shhh...dOn'tTellAnyone!",
  },
  publicRuntimeConfig: {},

}

export default nextConfig
