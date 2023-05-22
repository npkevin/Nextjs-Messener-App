import type { NextApiRequest, NextApiResponse } from "next"
import { MongoClient } from "mongodb"
import * as JWT from "jsonwebtoken"

import { _URI_, SignInResponse, TokenPayload, verifyAuthToken, generateAuthToken } from "./auth"

const client = new MongoClient(_URI_)

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET" && req.cookies?.auth_jwt) {
        process.stdout.write("Attempting to verify token ...")
        const token: JsonWebKey = req.cookies.auth_jwt as JsonWebKey
        if (verifyAuthToken(token, true)) {
            const result = await refreshToken(token)
            if (result !== null) res.status(200).json(result)
            else res.status(401).send("")
            return
        } else {
            process.stdout.write(" Invalid Token\n")
            res.status(401).send("")
        }
    }
    res.status(400).send("")
}

const refreshToken = async (token: JsonWebKey): Promise<SignInResponse | null> => {

    await client.connect()
    const users = client.db("next-messenger").collection("users")
    const foundUser = await users.findOne({ jwt: token })
    if (foundUser === null) {
        process.stdout.write(" Not Found\n")
        return null
    }

    if (!verifyAuthToken(token)) { // Expired
        process.stdout.write(" Time Expired! - Renewing JWT.\n")
        const payload: TokenPayload = {
            user_cred: {
                username: foundUser.username,
                password: foundUser.password,
            },
            user_id: foundUser._id
        }
        const refreshedToken = generateAuthToken(payload)
        await users.updateOne({ jwt: token }, { $set: { jwt: refreshedToken } })
        return {
            id: foundUser._id,
            name: { first: foundUser.firstname, last: foundUser.lastname },
            jwt: refreshedToken,
        }
    } else { // Not Expired
        // process.stdout.write(" Valid (" + ((decoded.exp - Date.now() / 1000) / 60).toFixed(2) + "min)\n")
        process.stdout.write(" Valid")
        return {
            id: foundUser._id,
            name: { first: foundUser.firstname, last: foundUser.lastname },
        }
    }
}