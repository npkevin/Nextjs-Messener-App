import { NextApiRequest, NextApiResponse } from "next";
import { searchUserConvos } from "@/service/convo.service";
import { validateToken } from "@/service/user.service";
import UserModel, { UserDocument } from "@/models/user.model";
import { ConvoGlance, User } from "@/components/SideMenu/ConversationsList";
import cookie from "cookie";

const handleSearchRequest = async (req: NextApiRequest, res: NextApiResponse) => {
    const { token } = cookie.parse(req.headers.cookie || "");
    if (!token) res.status(400).send("Invalid Request: Token Required");

    const client = await validateToken(token);
    if (!client) return res.status(400).send("Invalid Request: Invalid Token");

    if (req.method == "GET") {
        const { search_string } = req.query;
        if (Array.isArray(search_string) /** || Array.isArray(other_queries) */)
            return res.status(400).send("Invalid Request: Too many parameters");

        // 1. Manual search by name
        if (search_string) {
            await searchUserConvoHandler(res, client, search_string);
            return;
        }
        // 2. Search by token > convo contents

        // default for now
        return demo_getRecentUsers(res, client);
    }
};

export default handleSearchRequest;

// returns convoId, name and lastmessage
const searchUserConvoHandler = async (
    res: NextApiResponse,
    client: UserDocument,
    search_string: string,
) => {
    const convos = await searchUserConvos(client, search_string);
    if (!convos) return res.status(200).json([]);

    const result: ConvoGlance[] = [];
    for (const convo of convos) {
        let other_users_cleaned: User[] = [];
        for (const user of convo.other_users) {
            other_users_cleaned.push({
                id: user._id,
                name: user.name,
            });
        }

        result.push({
            convo_id: convo._id,
            other_users: other_users_cleaned,
            recent_messages: convo.recent_messages,
            matched_messages: convo.matched_messages,
        });
    }
    res.status(200).json(result);
};

// Returns 5 most recently registered users
async function demo_getRecentUsers(res: NextApiResponse, client: UserDocument) {
    const recent_users = (await UserModel.find({ _id: { $ne: client._id } })
        .sort({ createdAt: -1 })
        .limit(10)) as UserDocument[];

    if (!recent_users) return res.status(404).send([]);

    // type User_trimmed = Omit<CreateUserInput, 'password'> & { _id: ObjectId }
    const recent_users_trimmed = recent_users.map((user) => {
        const { _id, name, email } = user;
        return { _id, name, email };
    });
    return res.status(200).send(recent_users_trimmed);
}
