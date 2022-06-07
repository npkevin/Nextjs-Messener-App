// This is a SIMPLE PLAINTEXT with JWT Authentication Module!!!
//
// DO NOT USE IN ANY PRODUCTION

import type { NextApiRequest, NextApiResponse } from "next"
import type { WithId, Document, InsertOneResult, Collection, UpdateResult, ObjectId } from "mongodb"
import { MongoClient } from "mongodb"

// JWT doesn't support ES6 😢
const JWT = require('jsonwebtoken')
export const _SECRET_: string = "DEM0_(KE3p)It-a[S3cr3t]"
export const _EXIPIRY_: string = "12h"

export const _URI_: string = "mongodb://127.0.0.1:27017/"
const client = new MongoClient(_URI_)

type Error = {
    error: string,
    message: string,
}

type UserCredential = {
    username: string,
    password: string,
}

type UserInfo = {
    firstname: string,
    lastname: string,
}

export type SignInResponse = {
    display_name: string,
    jwt?: JsonWebKey,
    error?: string,
}

export type JwtPayload = {
    user_cred: UserCredential,
    user_oid: ObjectId
}

export const pretifyName = (firstname: string, lastname: string): string => {
    const firstName = firstname[0].toUpperCase() + firstname.substring(1)
    const lastName = lastname[0].toUpperCase() + lastname.substring(1)
    const fullName = firstName + " " + lastName
    return fullName
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    // Login / Signup
    if (req.method === "POST" && req.headers["content-type"] === "application/json") {

        let result;
        // Sign Up
        if (req.query.signup === "true") {
            result = await signUp({
                username: req.body.username,
                password: req.body.password,
            }, {
                firstname: req.body.firstname,
                lastname: req.body.lastname
            })
            if (!result.error) {
                res.status(201).json(result)
                return
            }
        }
        // Sign In
        else {
            result = await signIn({
                username: req.body.username,
                password: req.body.password,
            })
            if (!result.error) {
                res.status(200).json(result)
                return
            }
        }

        // Error
        res.status(500).json(result)
    }
}

const signIn = async (cred: UserCredential): Promise<SignInResponse | Error> => {

    if (!cred.username || !cred.password)
        return {
            error: "Invalid User Credential",
            message: "Username or Password is empty",
        }

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
                const payload: JwtPayload = {
                    user_cred: {
                        username: foundUser.username,
                        password: foundUser.password,
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
                        display_name: pretifyName(foundUser.firstname, foundUser.lastname),
                        jwt: token,
                    }
                }
            }
        }
        // No user Found
        else {
            return {
                error: "Invalid Username/Password",
                message: ""
            }
        }
    }
    catch (err) {
        console.error(err)
    }
    return {
        error: "Internal Error",
        message: "",
    }
}

const signUp = async (cred: UserCredential, form: UserInfo): Promise<SignInResponse | Error> => {
    console.log("Signing up new login")
    try {

        await client.connect()
        const users = client.db("next-messenger").collection("users")
        const foundUser: WithId<Document> | null = await users.findOne({
            username: { $eq: cred.username },
        })

        // User already exists
        if (foundUser !== null)
            return {
                error: "Invalid Username",
                message: "Username already exists"
            }

        const insertResult: InsertOneResult<Document> = await users.insertOne({
            ...cred,
            ...form,
            conversations: [],
        })
        const payload: JwtPayload = {
            user_cred: {
                username: cred.username,
                password: cred.password,
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
                display_name: pretifyName(form.firstname, form.lastname),
                jwt: token,
            }
        }
    } catch (err) {
        console.error(err)
    }
    return {
        error: "Internal Error",
        message: "",
    }
}