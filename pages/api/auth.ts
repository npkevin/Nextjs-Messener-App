// This is a SIMPLE PLAINTEXT with JWT Authentication Module!!!
//
// DO NOT USE IN ANY PRODUCTION

import type { NextApiRequest, NextApiResponse } from "next"
import type { WithId, Document, InsertOneResult, Collection, UpdateResult, ObjectId } from "mongodb"
import { MongoClient } from "mongodb"
import { passThroughSymbol } from "next/dist/server/web/spec-compliant/fetch-event"

// JWT doesn't support ES6 😢
const JWT = require('jsonwebtoken')
export const _SECRET_: string = "DEM0_(KE3p)It-a[S3cr3t]"
export const _EXIPIRY_: string = "12h"

export const _URI_: string = "mongodb://127.0.0.1:27017/"
const client = new MongoClient(_URI_)

type Credential = {
    username: string,
    password: string,
    firstName: string,
    lastName: string,
}

export type tUserInfo = {
    display_name: string,
    jwt?: JsonWebKey
}

export type tJwtPayload = {
    user_cred: Credential,
    user_oid: ObjectId
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    // Login / Signup
    if (req.method === "POST" && req.headers["content-type"] === "application/json") {

        const result = await login({
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        })

        if (result !== null) {
            res.status(200).send(result)
        } else {
            res.status(500).send('')
        }
    }
}

// Signup if user does not exist
const login = async (cred: Credential): Promise<tUserInfo | null> => {
    try {
        await client.connect()
        const users = client.db("next-messenger").collection("users")
        const foundUser: WithId<Document> | null = await users.findOne({
            username: { $eq: cred.username },
            password: { $eq: cred.password },
        })

        // Login without jwt... create a new jwt
        if (foundUser !== null) {
            console.log("Existing user login found... Creating new JWT")
            if (foundUser.username === cred.username && foundUser.password === cred.password) {
                const payload: tJwtPayload = {
                    user_cred: {
                        username: foundUser.username,
                        password: foundUser.password,
                        firstName: foundUser.firstName,
                        lastName: foundUser.lastName,
                    },
                    user_oid: foundUser._id
                }
                const token: JsonWebKey = JWT.sign(
                    payload,
                    _SECRET_,
                    { expiresIn: _EXIPIRY_ }
                )
                const result = await users.updateOne(
                    { _id: { $eq: foundUser._id } },
                    { $set: { jwt: token } },
                )

                if (result !== null) {
                    return {
                        display_name: foundUser.firstName + " " + foundUser.lastName,
                        jwt: token,
                    }
                } else {
                    return null
                }
            }
            return null
        }

        // Sign up
        if (cred.firstName !== "" && cred.lastName !== "") {
            return await SignUp(cred, users)
        } else {
            console.error("First and Last name missing to SignUp", cred)
            return null
        }
    }
    catch (err) {
        console.error(err)
        return null
    }
}

const SignUp = async (cred: Credential, users: Collection<Document>): Promise<tUserInfo | null> => {
    console.log("Signing up new login")
    try {
        const insertResult: InsertOneResult<Document> = await users.insertOne({
            ...cred,
            conversations: [],
        })
        const payload: tJwtPayload = {
            user_cred: {
                username: cred.username,
                password: cred.password,
                firstName: cred.firstName,
                lastName: cred.lastName,
            },
            user_oid: insertResult.insertedId
        }
        const token: JsonWebKey = JWT.sign(payload, _SECRET_, { expiresIn: _EXIPIRY_ })
        const updateResult: UpdateResult = await users.updateOne(
            { _id: { $eq: insertResult.insertedId } },
            { $set: { jwt: token } }
        )

        if (updateResult.acknowledged && updateResult.modifiedCount === 1) {
            return {
                display_name: cred.firstName + " " + cred.lastName,
                jwt: token,
            }
        }
    } catch (err) {
        console.error(err)
    }
    return null
}