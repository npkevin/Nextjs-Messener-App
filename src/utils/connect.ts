import mongoose from "mongoose"
import getConfig from "next/config"
import logger from '../utils/logger'

mongoose.set('strictQuery', false) // prepare for mongoose 7 change

const connect = async () => {
    const { dbUri } = getConfig().serverRuntimeConfig

    try {
        await mongoose.connect(dbUri)
        logger.info('Connected to MongoDB')
    } catch (err) {
        logger.error('Failed to connect to MongoDB')
        logger.error(err)
        process.exit(1)
    }
}

export default connect