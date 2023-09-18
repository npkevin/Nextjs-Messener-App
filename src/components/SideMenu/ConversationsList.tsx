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
    other_users: User[];
    recent_messages: MessageDocument[];
    matched_messages: MessageDocument[];
};

export type UserGlance = {
    other_user: User;
    recent_messages: MessageDocument[];
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
    const [users, setUsers] = useState<UserGlance[]>([]);
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

    const selectUserHandler = async (g: UserGlance) => {
        const url_params = new URLSearchParams();
        url_params.set("user_id", g.other_user.id.toString());
        const response = await fetch(`/api/conv?${url_params}`);
        if (response.ok) {
            const { convo_id, messages } = await response.json();
            const other_user = g.other_user;
            setState({
                convo: {
                    id: new mongoose.Types.ObjectId(convo_id),
                    user: {
                        id: new mongoose.Types.ObjectId(other_user.id),
                        name: other_user.name,
                    },
                    messages: messages as MessageDocument[],
                },
            });
        }
    };

    const selectConvoHandler = async (g: ConvoGlance) => {
        const url_params = new URLSearchParams();
        url_params.set("convo_id", g.convo_id.toString());
        const response = await fetch(`/api/conv?${url_params}`);
        if (response.ok) {
            const messages = await response.json();
            const other_user = g.other_users[0];
            setState({
                convo: {
                    id: new mongoose.Types.ObjectId(g.convo_id),
                    user: {
                        id: new mongoose.Types.ObjectId(other_user.id),
                        name: other_user.name,
                    },
                    messages: messages as MessageDocument[],
                },
            });
        }
    };

    const LI_UserGlance = ({ glance }: { glance: UserGlance }): JSX.Element => {
        const user = glance.other_user;
        return (
            <li
                className="p-1 mt-2 rounded drop-shadow cursor-pointer select-none bg-slate-300 transition hover:bg-slate-400"
                onClick={() => selectUserHandler(glance)}
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
                    <LI_UserGlance glance={u} key={u.other_user.id} />
                ))}
                {convos.map((g) => (
                    <LI_ConvoGlance glance={g} key={g.convo_id.toString()} />
                ))}
            </ul>
        </div>
    );
};

export default ConversationList;
