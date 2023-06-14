import mongoose from "mongoose"
import logger from '../utils/logger'
import getConfig from "next/config"

mongoose.set('strictQuery', false) // prepare for mongoose 7 change

const connect = async () => {
    const MONGODB_URI = process.env.MONGODB_URI || getConfig().serverRuntimeConfig.MONGODB_URI
    if (MONGODB_URI) {
        try {
            if (mongoose.connection.readyState !== 1) {
                await mongoose.connect(MONGODB_URI)
                logger.info('Connected to MongoDB')
            }
        } catch (err) {
            logger.error('Failed to connect to MongoDB')
            logger.error(err)
            process.exit(1)
        }
    } else {
        logger.error('Failed to connect to MongoDB: NO DB_URI')
        process.exit(1)
    }
}

export default connect