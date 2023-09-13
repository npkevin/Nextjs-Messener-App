import { useContext } from "react";
import { AppStateCtx } from "@/pages/index";

import Profile from "./Profile";
import Authentication from "@/components/SideMenu/Authentication";
import ConversationList from "@/components/SideMenu/ConversationsList";

import { PiChatsTeardropDuotone } from "react-icons/pi";

const SideMenu = (): JSX.Element => {
    const { state, setState } = useContext(AppStateCtx);

    return (
        <div
            data-testid="side_menu"
            className="flex flex-col w-80 min-w max-w-md h-full p-3 bg-slate-200 rounded drop-shadow"
        >
            <Banner />
            {state.validToken ? <Profile /> : null}
            {state.validToken ? <ConversationList /> : null}
            <Authentication />
        </div>
    );
};

const Banner = (): JSX.Element => {
    return (
        <div className="flex flex-row items-center mb-3 ">
            <PiChatsTeardropDuotone className="w-10 h-10 text-slate-900" />
            <span className="ml-4 text-2xl text-slate-900 select-none">messenger</span>
        </div>
    );
};

export const Seperator = (): JSX.Element => {
    return (
        <div className="flex flex-row justify-center my-3">
            <div className="h-0.5 rounded-full bg-slate-300 w-56" />
        </div>
    );
};

export default SideMenu;
