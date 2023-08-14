import { useContext } from "react";
import { AppStateCtx } from "../../../pages";

import { PiUserBold } from "react-icons/pi";

const Profile = (): JSX.Element => {
    const { state, setState } = useContext(AppStateCtx);

    return (
        <div className="flex flex-row p-1 drop-shadow rounded items-center bg-slate-300 ">
            <PiUserBold className="w-10 h-10 mr-2 p-1.5 rounded-full shadow bg-white" />
            <div className="flex flex-col">
                <span className="text-sm">
                    {state.user
                        ? `${state.user.name.first} ${state.user.name.last}`.toUpperCase()
                        : ""}
                </span>
                <span className="text-xs">
                    {"Online" /* TODO: Actual status changing*/}
                </span>
            </div>
        </div>
    );
};

export default Profile;
