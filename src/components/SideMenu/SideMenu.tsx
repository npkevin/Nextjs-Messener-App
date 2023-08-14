import Authentication from "./Authentication";
import ConversationList from "./ConversationsList";
import Profile from "./Profile";
import { useContext } from "react";
import { AppStateCtx } from "../../../pages";

import { PiChatsTeardropDuotone } from "react-icons/pi";

const SideMenu = (): JSX.Element => {
    const { state, setState } = useContext(AppStateCtx);

    return (
        <div className="flex flex-col w-80 h-screen p-4 bg-slate-100 shadow">
            <div className="flex items-center">
                <PiChatsTeardropDuotone className="w-10 h-10" />
                <span className=" text-2xl ml-4">mockingbird</span>
            </div>
            {state.validToken ? <Profile /> : null}
            {state.validToken ? <ConversationList /> : null}
            <Authentication />
        </div>
    );
};

export default SideMenu;
