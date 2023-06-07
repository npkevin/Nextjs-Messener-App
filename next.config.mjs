/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  serverRuntimeConfig: {
    origin: "",
    socketio: "",
    saltWorkFactor: 10,
    jwt_secret: "shhh...dOn'tTellAnyone!",
  },
  publicRuntimeConfig: {},

}

export default nextConfig
