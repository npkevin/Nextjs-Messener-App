import type { NextPage } from "next";
import { createContext, useEffect, useState } from "react";
import cookies from "js-cookie";

import SideMenu from "@/components/SideMenu/SideMenu";
import MessengerView from "@/components/Messenger/MessengerView";

import mongoose from "mongoose";
import { MessageDocument } from "@/models/message.model";

export type ConvoState = {
    id: string;
    user: User;
    messages: MessageDocument[];
};

export type User = {
    id: string;
    name: {
        first: string;
        middle?: string;
        last: string;
    };
};

interface IdefaultState {
    validToken: boolean;
    user?: {
        name: {
            first: string;
            last: string;
            middle: string;
        };
    };
    convo?: ConvoState;
}
const defaultState: IdefaultState = {
    validToken: false,
    user: undefined,
    convo: undefined,
};

interface IAppState {
    state: IdefaultState;
    setState: (new_state: {}) => void;
}
export const AppStateCtx = createContext<IAppState>({
    state: defaultState,
    setState: () => undefined,
});

const Home: NextPage = (): JSX.Element => {
    const [state, _setState] = useState(defaultState);
    const setState = (new_state: {}) =>
        _setState((prev_state: IdefaultState) => ({ ...prev_state, ...new_state }));

    useEffect(() => {
        const checkCookieToken = async () => {
            const response = await fetch(`/api/auth`);

            if (!response.ok) cookies.remove("token");
            else {
                const response_json = await response.json();
                setState({
                    validToken: true,
                    user: { name: response_json.name },
                });
            }
        };
        const token = cookies.get("token");
        if (token && !state.validToken) {
            checkCookieToken();
        }

        return () => {
            // cleanup
        };
    }, [state.validToken]);

    return (
        <AppStateCtx.Provider value={{ state, setState }}>
            <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
            <div className="flex flex-row h-screen w-screen p-3 bg-slate-400">
                <SideMenu />
                <MessengerView />
            </div>
        </AppStateCtx.Provider>
    );
};

export default Home;
