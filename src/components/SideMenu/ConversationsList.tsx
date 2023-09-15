import { useContext, useEffect, useState } from "react";
import mongoose from "mongoose";

import { AppStateCtx, ConvoState } from "@/pages/index";
import { CreateUserInput } from "@/schema/user.schema";
import { MessageDocument } from "@/models/message.model";

import { Seperator } from "@/components/SideMenu/SideMenu";
import { Button, TextInput } from "../UI/Input";
import { PiUserBold, PiChatTeardropDotsBold } from "react-icons/pi";
import { UserDocument } from "@/models/user.model";
import { ConvoDocument } from "@/models/convo.model";

export type ConvoGlance = {
    convo_id: string;
    other_users: UserDocument[];
    recent_messages: MessageDocument[];
    matched_messages: MessageDocument[];
};

export type User = {
    id: string;
    name: {
        first: string;
        middle?: string;
        last: string;
    };
};

const ConversationList = (): JSX.Element => {
    const { state, setState } = useContext(AppStateCtx);
    const [users, setUsers] = useState<UserDocument[]>([]);
    const [convos, setConvos] = useState<ConvoGlance[]>([]);
    const [search, setSearch] = useState<string>("");
    const [TO, setTO] = useState<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        fetch(`/api/search`)
            .then(async (response) => {
                setUsers(await response.json());
            })
            .catch();
    }, []);

    const clearSearch = () => {
        console.log("Clearing search");
        setSearch("");
        setConvos([]);
    };
    const searchConvos = async (search_string: string) => {
        clearTimeout(TO);
        if (!search_string) {
            clearSearch();
            return;
        }

        const TO_id = setTimeout(() => {
            const url_params = new URLSearchParams();
            url_params.set("search_string", search_string);
            fetch(`/api/search?${url_params}`)
                .then(async (response) => {
                    if (response.ok) {
                        const convos = (await response.json()) as ConvoGlance[];
                        if (Array.isArray(convos) && convos) {
                            setConvos(convos);
                            return;
                        }
                        setConvos([]);
                    }
                })
                .catch();
        }, 400);

        setTO(TO_id);
    };

    const selectUserHandler = async (user: UserDocument) => {
        let url_params = new URLSearchParams();
        url_params.set("user_id", user._id.toString());
        const response = await fetch(`/api/conv?${url_params}`);
        if (response.ok) {
            const convo_doc = (await response.json()) as ConvoDocument;
            const messages_history = convo_doc.messages as MessageDocument[];
            const messages_history_casted = messages_history.map((message) => {
                message.sender_id = new mongoose.Types.ObjectId(message.sender_id);
                message.convo_id = new mongoose.Types.ObjectId(message.convo_id);
                message.createdAt = new Date(message.createdAt);
                message.updatedAt = new Date(message.updatedAt);
                return message;
            });
            console.log(convo_doc);
            setState({
                convo: {
                    id: new mongoose.Types.ObjectId(convo_doc._id),
                    user: {
                        id: new mongoose.Types.ObjectId(user._id),
                        name: user.name,
                    },
                    messages: messages_history_casted,
                },
            });
        }
    };

    // mostly just type casting
    const selectConvoHandler = async (g: ConvoGlance) => {
        let url_params = new URLSearchParams();
        url_params.set("convo_id", g.convo_id.toString());
        const response = await fetch(`/api/conv?${url_params}`);
        if (response.ok) {
            const messages = (await response.json()) as MessageDocument[];
            const other_user = g.other_users[0];
            setState({
                convo: {
                    id: new mongoose.Types.ObjectId(g.convo_id),
                    user: {
                        id: new mongoose.Types.ObjectId(other_user.id),
                        name: other_user.name,
                    },
                    messages: messages,
                },
            });
        }
    };

    const LI_UserGlance = ({ user }: { user: UserDocument }): JSX.Element => {
        return (
            <li
                className="p-1 mt-2 rounded drop-shadow cursor-pointer select-none bg-slate-300 transition hover:bg-slate-400"
                onClick={() => selectUserHandler(user)}
            >
                <div className="flex flex-row items-center">
                    <PiUserBold className="w-10 h-10 p-1.5 rounded-full shadow bg-white" />
                    <div className="flex flex-col ml-2">
                        <span className="text-sm">
                            {`${user.name.first} ${user.name.last}`.toUpperCase()}
                        </span>
                        <span className="text-xs">
                            {"Offline" /* TODO: Actual status changing*/}
                        </span>
                    </div>
                </div>
            </li>
        );
    };

    const LI_ConvoGlance = ({ glance }: { glance: ConvoGlance }): JSX.Element => {
        const user = glance.other_users[0]; // only 1 for now
        return (
            <li
                className="p-1 mt-2 rounded drop-shadow cursor-pointer select-none bg-slate-300 transition hover:bg-slate-400"
                key={glance.convo_id.toString()}
                onClick={() => selectConvoHandler(glance)}
            >
                <div className="flex flex-row items-center">
                    <PiChatTeardropDotsBold className="w-10 h-10 p-1.5 rounded-full " />
                    <div className="flex flex-col ml-2 text-xs">
                        <span>{`${user.name.first} ${user.name.last}`.toUpperCase()}</span>
                        <span>{glance.matched_messages[0].content}</span>
                    </div>
                </div>
            </li>
        );
    };

    return (
        <div className={"flex flex-col"}>
            <Seperator />
            <div className="flex flex-row">
                <TextInput
                    className="rounded-r-none grow"
                    placeholder="Search Conversations"
                    state={[search, setSearch]}
                    onChange={(e) => searchConvos(e.target.value)}
                />
                <Button className="rounded-l-none w-8" value={"X"} onClick={clearSearch} />
            </div>
            <span className="text-slate-900 text-xs mt-2">Recent/New Users</span>
            <ul>
                {/* TODO: Swap list on select option */}
                {users.map((u) => (
                    <LI_UserGlance user={u} key={u._id} />
                ))}
                {convos.map((g) => (
                    <LI_ConvoGlance glance={g} key={g.convo_id.toString()} />
                ))}
            </ul>
        </div>
    );
};

export default ConversationList;
