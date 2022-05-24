// This is a SIMPLE PLAINTEXT with JWT Authentication Module!!!
//
// DO NOT USE IN ANY PRODUCTION

import type { NextApiRequest, NextApiResponse } from "next"
import type { WithId, Document, InsertOneResult, Collection, UpdateResult, ObjectId } from "mongodb";
import { MongoClient } from "mongodb";

// JWT doesn't support ES6 😢
const JWT = require('jsonwebtoken');
export const _SECRET_ = "DEM0_(KE3p)It-a[S3cr3t]"
export const _EXIPIRY_ = "10s"

const client = new MongoClient("mongodb://127.0.0.1:27017/")

type Credential = {
    username: string,
    password: string,
}

export type tUserInfo = {
    display_name: string,
    jwt?: JsonWebKey
}

export type tJwtPayload = {
    username: string,
    password: string,
    user_oid: ObjectId
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    // Login / Signup
    if (req.method === "POST" && req.headers["content-type"] === "application/json") {

        const result = await login({
            username: req.body.username,
            password: req.body.password,
        });

        if (result !== null) {
            res.status(200).send(result);
        } else {
            res.status(500).send('');
        }
    }
}

// Signup if user does not exist
const login = async (cred: Credential): Promise<tUserInfo | null> => {
    try {
        await client.connect()
        const users = client.db("next-messenger").collection("users");
        const foundUser: WithId<Document> | null = await users.findOne({
            username: { $eq: cred.username },
            password: { $eq: cred.password },
        });

        // Login without jwt... create a new jwt
        if (foundUser !== null) {
            console.log("Existing user login found... Creating new JWT")
            if (foundUser.username === cred.username && foundUser.password === cred.password) {
                const payload: tJwtPayload = {
                    ...cred,
                    user_oid: foundUser._id
                }
                const token: JsonWebKey = JWT.sign(
                    payload,
                    _SECRET_,
                    { expiresIn: _EXIPIRY_ }
                );
                const result = await users.updateOne(
                    { _id: { $eq: foundUser._id } },
                    { $set: { jwt: token } },
                );

                if (result !== null) {
                    return {
                        display_name: foundUser.username,
                        jwt: token,
                    };
                } else {
                    return null;
                }
            }
            return null
        }

        // Sign up
        return await SignUp(cred, users);
    }
    catch (err) {
        console.error(err);
        return null;
    }
}

const SignUp = async (cred: Credential, users: Collection<Document>): Promise<tUserInfo | null> => {
    console.log("Signing up new login")
    try {
        const insertResult: InsertOneResult<Document> = await users.insertOne({
            ...cred,
            conversations: [],
        });
        const payload: tJwtPayload = {
            ...cred,
            user_oid: insertResult.insertedId
        }
        const token: JsonWebKey = JWT.sign(payload, _SECRET_, { expiresIn: _EXIPIRY_ })
        const updateResult: UpdateResult = await users.updateOne(
            { _id: { $eq: insertResult.insertedId } },
            { $set: { jwt: token } }
        );

        if (updateResult.acknowledged && updateResult.modifiedCount === 1) {
            return {
                display_name: cred.username,
                jwt: token,
            };
        }
    } catch (err) {
        console.error(err)
    }
    return null
}