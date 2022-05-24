import type { NextApiRequest, NextApiResponse } from "next"
import { MongoClient } from "mongodb";
import { _EXIPIRY_, _SECRET_, tUserInfo } from "./auth";

const JWT = require('jsonwebtoken');

const uri = "mongodb://127.0.0.1:27017/"
const client = new MongoClient(uri)

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET" && req.cookies?.auth_jwt) {
        const result = await refreshToken(req.cookies.auth_jwt as JsonWebKey)

        if (result !== null) res.status(200).json(result);
        else res.status(401).send("");
        console.log(result);

        return;
    }
    res.status(400).send("");
}

// Given a token check that it is:
//  - Verified
//  - Not Expired
const refreshToken = async (token: JsonWebKey): Promise<tUserInfo | null> => {
    process.stdout.write("Attempting to verify token ...")

    try {
        await client.connect()
    } catch (err) {
        console.error("Could not connect to MongoDB", err)
        return null;
    }

    const users = client.db("next-messenger").collection("users");

    return await JWT.verify(token, _SECRET_, async (err: Error, decoded: any): Promise<tUserInfo | null> => {

        const foundUser = await users.findOne({
            jwt: { $eq: token }
        });

        if (foundUser === null) {
            process.stdout.write(" Not Found\n")
            return null;
        }

        if (err) {
            if (err.name === "TokenExpiredError") {
                process.stdout.write(" Time Expired! - Renewing JWT.\n");
                const newJwt = JWT.sign(
                    {
                        username: foundUser.username,
                        password: foundUser.password,
                        user_oid: foundUser._id
                    },
                    _SECRET_,
                    {
                        expiresIn: _EXIPIRY_
                    }
                );

                await users.updateOne(
                    { jwt: { $eq: token } },
                    { $set: { jwt: newJwt } }
                );
                return {
                    display_name: foundUser.username,
                    jwt: newJwt,
                };
            }
            // Error, but not expired
            return null;

        } else { // No Error, validate
            if (decoded.username === foundUser.username && decoded.password === foundUser.password) {
                process.stdout.write(" Valid (" + ((decoded.exp - Date.now() / 1000) / 60).toFixed(2) + "min)\n")
                return {
                    display_name: foundUser.username,
                };
            } else {
                process.stdout.write(" Invalid\n")
                return null;
            }
        }
    })
}

// Verify there exists a user with:
//  - Same JWT
//  - matches username/password from JWT
export const verify = async (jwtToken: JsonWebKey): Promise<boolean> => {
    try {
        await client.connect();
    } catch (err) {
        console.error(err);
        return false;
    }
    // verify jwt
    return await JWT.verify(jwtToken, _SECRET_, async (err: Error, decoded: any) => {
        if (err) return err;
        const users = client.db("next-messenger").collection("users");
        const found = await users.findOne({
            jwt: { $eq: jwtToken },
            username: { $eq: decoded.username },
            password: { $eq: decoded.password },
        });
        return found !== null;
    });
}
