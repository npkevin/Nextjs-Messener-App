/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  serverRuntimeConfig: {
    dbUri: "mongodb://0.0.0.0:27017/messenger",
    saltWorkFactor: 10,
    jwt_secret: "shhh...dOn'tTellAnyone!",
  },
  publicRuntimeConfig: {},

}

export default nextConfig
