import { NextApiRequest, NextApiResponse } from "next";
import UserModel, { UserDocument } from "../../src/models/user.model";

// TODO: Properly implement searching, just returns all users at the moment
export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method == "GET") {
        // 1. Manual search by name
        const { search_all } = req.query
        if (search_all === "true") {
            return demo_getRecentUsers(req, res)
        }
        res.status(200).send({ test: true })
        // 2. Search by token > convo contents
    }
}

// Returns 5 most recently registered users
async function demo_getRecentUsers(req: NextApiRequest, res: NextApiResponse) {
    const recent_users = await UserModel.find().sort({ createdAt: -1 }).limit(5) as UserDocument[]

    if (!recent_users)
        return res.status(404).send([])

    // type User_trimmed = Omit<CreateUserInput, 'password'> & { _id: ObjectId }
    const recent_users_trimmed = recent_users.map(user => {
        const { _id, name, email } = user
        return { _id, name, email }
    })
    return res.status(200).send(recent_users_trimmed)
}