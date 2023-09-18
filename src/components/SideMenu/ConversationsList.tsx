import { useContext, useEffect, useState } from "react";
import mongoose from "mongoose";

import { AppStateCtx, ConvoState, User } from "@/pages/index";
import { MessageDocument } from "@/models/message.model";

import { Seperator } from "@/components/SideMenu/SideMenu";
import { Button, TextInput } from "../UI/Input";
import { PiUserBold, PiChatTeardropDotsBold } from "react-icons/pi";

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
            const convo_state: ConvoState = {
                id: convo_id,
                user: {
                    id: other_user.id,
                    name: other_user.name,
                },
                messages: messages as MessageDocument[],
            };
            setState({ convo: convo_state });
        }
    };

    const selectConvoHandler = async (g: ConvoGlance) => {
        const url_params = new URLSearchParams();
        url_params.set("convo_id", g.convo_id.toString());
        const response = await fetch(`/api/conv?${url_params}`);
        if (response.ok) {
            const messages = await response.json();
            const other_user = g.other_users[0];
            const convo_state: ConvoState = {
                id: g.convo_id,
                user: {
                    id: other_user.id,
                    name: other_user.name,
                },
                messages: messages as MessageDocument[],
            };
            setState({ convo: convo_state });
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
            <ul className="mt-2">
                <span className="text-slate-900 text-xs mt-2">
                    {convos.length > 0 ? "Search Results" : "Recent/New Users"}
                </span>
                {convos.length > 0
                    ? convos.map((g) => <LI_ConvoGlance glance={g} key={g.convo_id} />)
                    : users.map((g) => <LI_UserGlance glance={g} key={g.other_user.id} />)}
            </ul>
        </div>
    );
};

export default ConversationList;
