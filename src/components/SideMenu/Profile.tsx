import { useContext } from "react";
import { AppStateCtx } from "../../../pages";

import { PiUserBold } from "react-icons/pi";

const Profile = (): JSX.Element => {
    const { state, setState } = useContext(AppStateCtx);

    return (
        <div className="flex flex-row items-center bg-slate-300 p-2 rounded-lg">
            <PiUserBold className="w-10 h-10 p-1.5 mr-2 rounded-full bg-white" />
            <div className="flex flex-col">
                <span>
                    {state.user
                        ? `${state.user.name.first} ${state.user.name.last}`.toUpperCase()
                        : ""}
                </span>
                <span className="text-sm">
                    {"Online" /* TODO: Actual status changing*/}
                </span>
            </div>
        </div>
    );
};

export default Profile;
