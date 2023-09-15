import getConfig from "next/config";
import jwt from "jsonwebtoken";
import logger from "@/utils/logger";

import UserModel, { UserDocument } from "@/models/user.model";
import SessionModel, { IPayload, SessionDocument } from "@/models/sessions.model";
import { CreateUserInput } from "@/schema/user.schema";

export const createUser = async (input: CreateUserInput): Promise<UserDocument> => {
    try {
        return (await UserModel.create(input)) as UserDocument;
    } catch (error: any) {
        throw new Error(error);
    }
};

export const validatePassword = async ({
    email,
    password,
}: {
    email: string;
    password: string;
}): Promise<UserDocument> => {
    const user: UserDocument | null = await UserModel.findOne({ email: email });
    if (user == null) throw new Error("Invalid User");

    if (!(await user.comparePassword(password))) throw new Error("Invalid Password");
    // return omit(user.toJSON(), 'password')

    return user;
};

export const createSession = async (user: UserDocument): Promise<string | null> => {
    // find/create session document
    const session = await SessionModel.findOneAndUpdate(
        { user: user._id },
        {},
        { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (!session) return null;

    const token = await session.addSession();
    return token;
};

export const validateToken = async (token: string | string[]): Promise<UserDocument | null> => {
    if (!token) return null;
    if (Array.isArray(token)) return null;

    const { jwt_secret } = getConfig().serverRuntimeConfig;

    const decoded_token = jwt.verify(token, jwt_secret) as IPayload;
    const session = await SessionModel.findOne({
        user: decoded_token.user_id,
        sessions: { $in: [token] },
    });
    if (!session) return null;

    await session.populate("user");
    return session.user as unknown as UserDocument;
};

export const deleteToken = async (token: string): Promise<boolean> => {
    if (!token) return false;

    const { jwt_secret } = getConfig().serverRuntimeConfig;

    const decoded_token = jwt.verify(token, jwt_secret) as IPayload;
    const session = await SessionModel.findOne({
        user: decoded_token.user_id,
        sessions: { $in: [token] },
    });

    if (!session) return false;

    session.removeSession(token);
    return true;
};
