import Authentication from "./Authentication";
import ConversationList from "./ConversationsList";
import Profile from "./Profile";
import { useContext } from "react";
import { AppStateCtx } from "../../../pages";

import { PiChatsTeardropDuotone } from "react-icons/pi";

const SideMenu = (): JSX.Element => {
    const { state, setState } = useContext(AppStateCtx);

    return (
        <div className="flex flex-col w-80 h-screen p-4 bg-slate-200 shadow">
            <Banner />
            {state.validToken ? <Profile /> : null}
            {state.validToken ? <ConversationList /> : null}
            <Authentication />
        </div>
    );
};

const Banner = (): JSX.Element => {
    return (
        <div className={"flex flex-row items-center mb-1 "}>
            <PiChatsTeardropDuotone className="w-10 h-10 text-slate-900" />
            <span className="ml-4 text-2xl text-slate-900">messenger</span>
        </div>
    );
};

export const Seperator = (): JSX.Element => {
    return (
        <div className={`flex flex-row justify-center my-2`}>
            <div className={`h-0.5 rounded-full bg-slate-300 w-56`} />
        </div>
    );
};

export default SideMenu;
