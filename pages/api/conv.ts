import type { NextApiRequest, NextApiResponse } from "next"
import connect from "../../src/utils/connect"
import logger from "../../src/utils/logger"

import { createConvo } from "../../src/service/convo.service"
import { createConvoSchema, CreateConvoInput } from "../../src/schema/convo.schema"

export default async (req: NextApiRequest, res: NextApiResponse) => {
    await connect()

    if (req.method == "POST") {
        const parse_result = createConvoSchema.safeParse({ body: req.body })
        if (!parse_result.success)
            return res.status(403).send(parse_result.error.issues)
        return createConvoHandler(req, res)
    }

    if (req.method == "GET") {
    }

    res.status(405).send('')
}

async function createConvoHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const convo = await createConvo(req.body)
        return res.status(200).send(convo)
    } catch (error: any) {
        logger.error(error)
        return res.status(409).send(error.message)
    }
}

async function getConvoHandler(req: NextApiRequest, res: NextApiResponse) {

}

async function deleteConvoHandler(req: NextApiRequest, res: NextApiResponse) {

}