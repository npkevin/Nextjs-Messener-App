import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from "react";
import { AppStateCtx } from "../../../pages";
import cookies from "js-cookie";

import { TextInput, Button } from "../UI/Input";
import { PiXBold } from "react-icons/pi";

const Authentication = (): JSX.Element => {
    const { state, setState } = useContext(AppStateCtx);

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordConfirmation, setPasswordConfirmation] =
        useState<string>("");

    const [firstname, setFirstname] = useState<string>("");
    const [middlename, setMiddlename] = useState<string>("");
    const [lastname, setLastname] = useState<string>("");

    const [btnSignInDisable, setBtnSignInDisable] = useState<boolean>(false);
    const [btnSignUpDisable, setBtnSignUpDisable] = useState<boolean>(true);

    const [warning, setWarning] = useState<{ show: boolean; message: string }>({
        show: false,
        message: "",
    });

    useEffect(() => {
        const credInvalid = email === "" || password === "";
        setBtnSignInDisable(credInvalid || firstname !== "" || lastname !== "");
    }, [email, password, firstname, lastname]);

    const SignUp = async () => {
        if (btnSignUpDisable === true) {
            setBtnSignUpDisable(false);
            return;
        }
        const response: Response = await fetch(`/api/auth`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
                passwordConfirmation: passwordConfirmation,
                name: {
                    first: firstname,
                    middle: middlename,
                    last: lastname,
                },
            }),
        });
        const response_json = await response.json();
        if (response.ok) {
            cookies.set("token", response_json.session, { sameSite: "Strict" });
            setState({ validToken: true, user: { name: response_json.name } });
        } else {
            // assuming we only get zod parsing errors
            let message_string = "";
            response_json.forEach((error: any) => {
                message_string += "• " + error.message + "\n";
            });
            setWarning({ show: true, message: message_string }); // SafeParseError.error.issues[]
        }
    };

    const SignIn = async () => {
        const response: Response = await fetch(`/api/auth`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                signin: true,
                email: email,
                password: password,
            }),
        });
        const response_json = await response.json();
        if (response.ok) {
            cookies.set("token", response_json.session, { sameSite: "Strict" });
            setWarning({ show: false, message: warning.message });
            setState({ validToken: true, user: { name: response_json.name } });
        } else {
            // assuming we only get zod parsing errors
            let message_string = "";
            response_json.forEach((error: any) => {
                message_string += "• " + error.message + "\n";
            });
            setWarning({ show: true, message: message_string }); // SafeParseError.error.issues[]
        }
    };

    const SignOut = async () => {
        // clear fields
        setEmail("");
        setPassword("");
        setPasswordConfirmation("");
        setFirstname("");
        setMiddlename("");
        setLastname("");
        setBtnSignUpDisable(true);

        await fetch(`/api/auth`, { method: "DELETE" });
        cookies.remove("token");
        setState({ validToken: false, user: undefined, convo: undefined });
    };

    const signUpHide = btnSignUpDisable
        ? "pointer-events-none max-h-0 select-none opacity-0 "
        : "ease-in duration-200 max-h-40 ";

    const warningHide = warning.show
        ? "ease-in duration-200 opacity-100"
        : "display-none opacity-0 select-none pointer-events-none";

    return !state.validToken ? (
        <div className="flex flex-col">
            <div className={"flex flex-col " + signUpHide}>
                <TextInput
                    className="mt-2"
                    placeholder="First name"
                    state={[firstname, setFirstname]}
                />
                <TextInput
                    className="mt-2"
                    placeholder="Middle name (optional)"
                    state={[middlename, setMiddlename]}
                />
                <TextInput
                    className="mt-2"
                    placeholder="Last name"
                    state={[lastname, setLastname]}
                />
            </div>
            <div className="flex flex-col">
                <TextInput
                    type="email"
                    className="mt-2"
                    placeholder="Email"
                    state={[email, setEmail]}
                />
                <TextInput
                    type="password"
                    className="mt-2"
                    placeholder="Password"
                    state={[password, setPassword]}
                />
            </div>
            <div className={"flex flex-col " + signUpHide}>
                <TextInput
                    type="password"
                    className="mt-2"
                    placeholder="Confirm Password"
                    state={[passwordConfirmation, setPasswordConfirmation]}
                />
            </div>
            <div className="flex flex-row mt-3 justify-between gap-4">
                <Button
                    onClick={SignUp}
                    value="Sign Up"
                    className="w-full"
                    disabled={false}
                />
                <Button
                    onClick={SignIn}
                    value="Login"
                    className="w-full"
                    disabled={btnSignInDisable}
                />
            </div>
            <div
                className={
                    "flex flex-col mt-3 p-2 rounded-lg bg-amber-300 " +
                    warningHide
                }
            >
                <PiXBold
                    className="self-end cursor-pointer"
                    onClick={() =>
                        setWarning({ show: false, message: warning.message })
                    }
                />
                <span>{warning.message}</span>
            </div>
        </div>
    ) : (
        <div className="flex h-full items-end">
            <Button value="Sign Out" className="w-full" onClick={SignOut} />
        </div>
    );
};

export default Authentication;
