import { NextApiRequest, NextApiResponse } from "next";
import UserModel, { UserDocument } from "../../src/models/user.model";
import cookie from 'cookie'
import { validateToken } from "../../src/service/user.service";

// TODO: Properly implement searching, just returns all users at the moment
const handleSearchRequest =  async (req: NextApiRequest, res: NextApiResponse) => {

    const { token } = cookie.parse(req.headers.cookie || '')
    if (!token) res.status(400).send("Invalid Request: Token Required")

    if (req.method == "GET") {
        // 1. Manual search by name
        const { search_all } = req.query
        if (search_all === "true") {
            return demo_getRecentUsers(req, res, token)
        }
        res.status(200).send({ test: true })
        // 2. Search by token > convo contents
    }
}

export default handleSearchRequest

// Returns 5 most recently registered users
async function demo_getRecentUsers(req: NextApiRequest, res: NextApiResponse, token: string) {

    const user = await validateToken(token)
    if (!user) return res.status(400).send("Invalid Request: Invalid Token")

    const recent_users = await UserModel.find({ _id: { $ne: user._id } }).sort({ createdAt: -1 }).limit(10) as UserDocument[]

    if (!recent_users)
        return res.status(404).send([])

    // type User_trimmed = Omit<CreateUserInput, 'password'> & { _id: ObjectId }
    const recent_users_trimmed = recent_users.map(user => {
        const { _id, name, email } = user
        return { _id, name, email }
    })
    return res.status(200).send(recent_users_trimmed)
}