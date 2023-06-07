import { useContext, useEffect, useState } from 'react'
import cookies from 'js-cookie'

import styles from '../../styles/Authentication.module.css'
import { AppStateCtx } from '../../pages'
import getConfig from 'next/config'


const Authentication = (): JSX.Element => {

    const { state, setState } = useContext(AppStateCtx)

    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>("")

    const [firstname, setFirstname] = useState<string>("")
    const [middlename, setMiddlename] = useState<string>("")
    const [lastname, setLastname] = useState<string>("")

    const [btnSignInDisable, setBtnSignInDisable] = useState<boolean>(false)
    const [btnSignUpDisable, setBtnSignUpDisable] = useState<boolean>(true)

    const [warning, setWarning] = useState<{ show: boolean, message: string }>({ show: false, message: "" })

    useEffect(() => {
        const credInvalid = (email === "") || (password === "")
        setBtnSignInDisable(credInvalid || firstname !== "" || lastname !== "")
    })

    const SignUp = async () => {
        if (btnSignUpDisable === true) {
            setBtnSignUpDisable(false)
            return
        }
        const response: Response = await fetch(`/api/auth`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password,
                passwordConfirmation: passwordConfirmation,
                name: {
                    first: firstname,
                    middle: middlename,
                    last: lastname,
                }
            })
        })
        const response_json = await response.json()
        if (response.ok) {
            cookies.set("token", response_json.session, { sameSite: "Strict" })
            setState({ validToken: true, user: { name: response_json.name } })
        } else {
            // assuming we only get zod parsing errors
            let message_string = ""
            response_json.forEach((error: any) => { message_string += "• " + error.message + "\n" });
            setWarning({ show: true, message: message_string }) // SafeParseError.error.issues[]
        }
    }

    const SignIn = async () => {
        const response: Response = await fetch(`/api/auth`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                signin: true,
                email: email,
                password: password
            })
        })
        const response_json = await response.json()
        if (response.ok) {
            cookies.set("token", response_json.session, { sameSite: "Strict" })
            setState({ validToken: true, user: { name: response_json.name } })
        } else {
            // assuming we only get zod parsing errors
            let message_string = ""
            response_json.forEach((error: any) => { message_string += "• " + error.message + "\n" });
            setWarning({ show: true, message: message_string }) // SafeParseError.error.issues[]
        }
    }

    const SignOut = async () => {
        // clear fields
        setEmail("")
        setPassword("")
        setPasswordConfirmation("")
        setFirstname("")
        setMiddlename("")
        setLastname("")
        setBtnSignUpDisable(true)

        await fetch(`/api/auth`, { method: "DELETE" })
        cookies.remove('token')
        setState({ validToken: false, user: undefined })
    }

    return (!state.validToken ?
        <div className={styles.container}>
            <div className={styles.signUp + (btnSignUpDisable ? "" : " " + styles.signUp__unhide)}>
                <input
                    type="text"
                    placeholder='First name'
                    value={firstname}
                    onChange={event => setFirstname(event.target.value)}
                />
                <input
                    type="text"
                    placeholder='Middle name (optional)'
                    value={middlename}
                    onChange={event => setMiddlename(event.target.value)}
                />
                <input
                    type="text"
                    placeholder='Last name'
                    value={lastname}
                    onChange={event => setLastname(event.target.value)}
                />
            </div>
            <div>
                <input
                    type="email"
                    placeholder='Email'
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                />
                <input
                    type="password"
                    placeholder='Password'
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                />
            </div>
            <div className={styles.signUp + (btnSignUpDisable ? "" : " " + styles.signUp__unhide)}>
                <input
                    type="password"
                    placeholder='Confirm Password'
                    value={passwordConfirmation}
                    onChange={event => setPasswordConfirmation(event.target.value)}
                />
            </div>
            <div className={styles.signOptions}>
                <button onClick={SignUp}>Sign Up</button>
                <button onClick={SignIn} disabled={btnSignInDisable}>Login</button>
            </div>
            <div className={styles.signWarning + (warning.show ? " " + styles.signWarning__unhide : "")}>
                <button onClick={() => setWarning({ show: false, message: "" })}>x</button>
                <span style={{ whiteSpace: "pre-line" }}>{warning.message}</span>
            </div>
        </div>
        :
        <button onClick={SignOut}>Sign Out</button>
    )
}

export default Authentication