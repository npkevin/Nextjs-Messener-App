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
        : "opacity-0 select-none pointer-events-none";

    return !state.validToken ? (
        <div className="flex flex-col">
            <div className={"flex flex-col " + signUpHide}>
                <TextInput
                    placeholder="First name"
                    state={[firstname, setFirstname]}
                />
                <TextInput
                    placeholder="Middle name (optional)"
                    state={[middlename, setMiddlename]}
                />
                <TextInput
                    placeholder="Last name"
                    state={[lastname, setLastname]}
                />
            </div>
            <div className="flex flex-col">
                <TextInput
                    type="email"
                    placeholder="Email"
                    state={[email, setEmail]}
                />
                <TextInput
                    type="password"
                    placeholder="Password"
                    state={[password, setPassword]}
                />
            </div>
            <div className={"flex flex-col " + signUpHide}>
                <TextInput
                    type="password"
                    placeholder="Confirm Password"
                    state={[passwordConfirmation, setPasswordConfirmation]}
                />
            </div>
            <div className="flex flex-row justify-between">
                <Button onClick={SignUp} value="Sign Up" />
                <Button
                    onClick={SignIn}
                    value="Login"
                    disabled={btnSignInDisable}
                />
            </div>
            <div
                className={
                    "flex flex-col w-full mt-4 p-2 rounded-lg bg-amber-300 " +
                    warningHide
                }
            >
                <button
                    className="self-end"
                    onClick={() =>
                        setWarning({ show: false, message: warning.message })
                    }
                >
                    🞬
                </button>
                <span>{warning.message}</span>
            </div>
        </div>
    ) : (
        <button onClick={SignOut}>Sign Out</button>
    );
};

export default Authentication;
