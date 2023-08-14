import { useContext, useEffect, useState } from "react";
import { AppStateCtx } from "../../../pages";
import { Types } from "mongoose";

import { CreateUserInput } from "../../schema/user.schema";
import { ConvoDocument } from "../../models/convo.model";
import { MessageDocument } from "../../models/message.model";

import { PiUserBold } from "react-icons/pi";
import { TextInput } from "../UI/Input";
import { Seperator } from "./SideMenu";

type User = Omit<CreateUserInput, "password"> & { _id: Types.ObjectId };
type Convo = { id: Types.ObjectId };

const ConversationList = (): JSX.Element => {
    const { state, setState } = useContext(AppStateCtx);
    const [search, setSearch] = useState<string>("");
    const [users, setUsers] = useState<User[]>([]);
    const [convos, setConvos] = useState<Convo[]>([]);

    useEffect(() => {
        // TODO: remove this, only for dev
        let url_params = new URLSearchParams();
        url_params.set("search_all", "true");
        fetch(`/api/search?${url_params}`)
            .then(async (response) => {
                if (response.ok) {
                    const users_trimmed = (await response.json()) as User[];
                    setUsers(users_trimmed);
                }
            })
            .catch();
    }, []);

    const searchConvos = async (search_string: string) => {};

    const selectUserHandler = async (user: User) => {
        if (!state.convo || state.convo.user.id !== user._id) {
            let url_params = new URLSearchParams();
            url_params.set("user_id", user._id.toString());
            const response = await fetch(`/api/conv?${url_params}`);

            if (response.ok) {
                const convo_doc = (await response.json()) as ConvoDocument;
                const messages_history =
                    convo_doc.messages as MessageDocument[];
                const messages_history_casted = messages_history.map(
                    (message) => {
                        message.sender_id = new Types.ObjectId(
                            message.sender_id
                        );
                        message.convo_id = new Types.ObjectId(message.convo_id);
                        message.createdAt = new Date(message.createdAt);
                        message.updatedAt = new Date(message.updatedAt);
                        return message;
                    }
                );
                // console.log(convo_doc)
                setState({
                    convo: {
                        id: new Types.ObjectId(convo_doc._id),
                        user: {
                            id: new Types.ObjectId(user._id),
                            name: user.name,
                        },
                        messages_history: messages_history_casted,
                    },
                });
            }
        }
    };

    return (
        <div className={"flex flex-col"}>
            <Seperator />
            <TextInput
                placeholder="Search"
                state={[search, setSearch]}
                disabled={true}
            />
            <UserList onClick={selectUserHandler} users={users} />
        </div>
    );
};

const UserList = ({
    onClick,
    users,
}: {
    onClick: (user: User) => Promise<void>;
    users: User[];
}) => {
    return (
        <>
            <span className="text-slate-900 text-xs mt-2">
                Recent/New Users
            </span>
            <ul className="">
                {users.map((user) => (
                    <li
                        className="p-1 mt-2 rounded drop-shadow cursor-pointer select-none bg-slate-300 transition duration-100 ease-in-out hover:bg-slate-400"
                        key={user._id.toString()}
                        onClick={() => onClick(user)}
                    >
                        <div className="flex flex-row items-center">
                            <PiUserBold className="w-10 h-10 p-1.5 rounded-full shadow bg-white" />
                            <div className="flex flex-col ml-2">
                                <span className="text-sm">
                                    {`${user.name.first} ${user.name.last}`.toUpperCase()}
                                </span>
                                <span className="text-xs">
                                    {
                                        "Offline" /* TODO: Actual status changing*/
                                    }
                                </span>
                            </div>
                        </div>
                    </li>
                ))}
                {/* TODO: Get recent conversations
                convos.map((convo) => (
                    <li
                        className=""
                        key={convo.id.toString()}
                    >
                        <div className="">
                            <PiUserBold className="w-10 h-10 p-1.5 rounded-full shadow bg-white" />
                        </div>
                        <div className="flex flex-col ml-2">
                            <span>convo name</span>
                            <span>last message</span>
                        </div>
                    </li>
                ))*/}
            </ul>
        </>
    );
};

export default ConversationList;
