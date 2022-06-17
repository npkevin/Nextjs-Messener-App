import type { NextApiRequest, NextApiResponse } from "next"
import { MongoClient, ObjectId } from "mongodb"
import * as JWT from "jsonwebtoken"

import { _EXIPIRY_, _SECRET_, _URI_, SignInResponse, TokenPayload, pretifyName } from "./auth"

const client = new MongoClient(_URI_)

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET" && req.cookies?.auth_jwt) {
        const result = await refreshToken(req.cookies.auth_jwt)

        if (result !== null) res.status(200).json(result)
        else res.status(401).send("")

        return
    }
    res.status(400).send("")
}

// Given a token check that it is:
//  - Verified
//  - Not Expired
const refreshToken = async (token: string): Promise<SignInResponse | null> => {
    process.stdout.write("Attempting to verify token ...")

    await client.connect()
    const users = client.db("next-messenger").collection("users")
    const foundUser = await users.findOne({
        jwt: { $eq: token }
    })
    if (foundUser === null) {
        process.stdout.write(" Not Found\n")
        return null
    }


    return new Promise<SignInResponse | null>((resolve, reject) => {
        JWT.verify(token, _SECRET_, async (err, decoded: any) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    process.stdout.write(" Time Expired! - Renewing JWT.\n")
                    const payload: TokenPayload = {
                        user_cred: {
                            username: foundUser.username,
                            password: foundUser.password,
                        },
                        user_oid: foundUser._id
                    }
                    const newJwt = JWT.sign(
                        payload,
                        _SECRET_,
                        {
                            expiresIn: _EXIPIRY_
                        }
                    )

                    await users.updateOne(
                        { jwt: { $eq: token } },
                        { $set: { jwt: newJwt } }
                    )
                    resolve({
                        user_oid: foundUser._id,
                        display_name: pretifyName(foundUser.firstname, foundUser.lastname),
                        jwt: newJwt,
                    })
                }
                // Error, but not expired
                reject(null)

            } else { // No Error, validate
                if (decoded.user_cred.username === foundUser.username && decoded.user_cred.password === foundUser.password && decoded.exp) {
                    process.stdout.write(" Valid (" + ((decoded.exp - Date.now() / 1000) / 60).toFixed(2) + "min)\n")
                    resolve({
                        user_oid: foundUser._id,
                        display_name: pretifyName(foundUser.firstname, foundUser.lastname),
                    })
                } else {
                    process.stdout.write(" Invalid\n")
                    reject(null)
                }
            }
        })
    })
}

// Verify there exists a user with:
//  - Same JWT
//  - matches username/password from JWT
export const verify = async (token: string): Promise<boolean> => {
    if (!token) return false

    await client.connect()
    return new Promise((resolve, reject) => {
        JWT.verify(token, _SECRET_, async (err, decoded: any) => {
            if (err) {
                console.error(err)
                reject(false)
            }
            const users = client.db("next-messenger").collection("users")
            const found = await users.findOne({
                jwt: { $eq: token },
                username: { $eq: decoded.username },
                password: { $eq: decoded.password },
            })
            resolve(found !== null)
        })
    })
}
