import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../pages'
import cookies from 'js-cookie'

import styles from '../../styles/Authentication.module.css'
import { SignInResponse } from '../../pages/api/auth'


const Authentication = (): JSX.Element => {

    const app_ctx = useContext(AppContext)

    const [username, setUsername] = useState<string | undefined>("")
    const [password, setPassword] = useState<string | undefined>("")
    const [firstname, setFirstname] = useState<string | undefined>("")
    const [lastname, setLastname] = useState<string | undefined>("")
    const [btnSignInDisable, setBtnSignInDisable] = useState<boolean>(false)
    const [btnSignUpDisable, setBtnSignUpDisable] = useState<boolean>(true)
    const [warning, setWarning] = useState<{ show: boolean, message: string }>({ show: false, message: "" })

    useEffect(() => {
        const credInvalid: boolean = username === "" || password === ""
        setBtnSignInDisable(credInvalid || firstname !== "" || lastname !== "")
    })

    const signIn = async () => {
        if (cookies.get('auth_jwt')) return

        const params: URLSearchParams = new URLSearchParams()
        params.append("signup", "false")
        try {
            const response: Response = await fetch("http://localhost:3000/api/auth?" + params, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                })
            })

            const result: SignInResponse = await response.json()

            if (response.status === 200) {
                const jwt: string = result.jwt as string
                cookies.set('auth_jwt', jwt, { sameSite: 'strict', secure: true })
                app_ctx.setState({
                    ...app_ctx.state,
                    display_name: result.display_name,
                    jwt: jwt
                })
            } else {
                alert(result.error)
                app_ctx.setState({
                    ...app_ctx.state,
                    display_name: "",
                    jwt: undefined
                })
            }
        } catch (err) {
            console.error(err)
            signOut()
        }
    }

    const signUp = async () => {

        if (btnSignUpDisable === true) {
            setBtnSignUpDisable(false)
            return
        }

        if (!firstname || !lastname || !username || !password) {
            setWarning({ show: true, message: "Complete all fields and try again." })
            return
        }

        const params: URLSearchParams = new URLSearchParams()
        params.append("signup", "true")

        const response: Response = await fetch("http://localhost:3000/api/auth?" + params, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                firstname: firstname,
                lastname: lastname,
                username: username,
                password: password,
            })
        })

        const result: SignInResponse = await response.json()

        if (response.status === 201) {
            const jwt: string = result.jwt as string
            cookies.set('auth_jwt', jwt, { sameSite: 'strict', secure: true })
            app_ctx.setState({
                ...app_ctx.state,
                display_name: result.display_name,
                jwt: jwt
            })
        } else {
            alert(result.error)
            app_ctx.setState({
                ...app_ctx.state,
                display_name: "",
                jwt: undefined
            })
        }
    }

    const signOut = () => {
        setUsername("")
        setPassword("")
        setFirstname("")
        setLastname("")
        setBtnSignUpDisable(true)
        cookies.remove('auth_jwt')
        app_ctx.setState({
            ...app_ctx.state,
            display_name: "",
            jwt: undefined
        })
    }

    // Render
    return (!app_ctx.state.jwt ?
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
                    placeholder='Last name'
                    value={lastname}
                    onChange={event => setLastname(event.target.value)}
                />
            </div>
            <div>
                <input
                    type="username"
                    placeholder='Username'
                    value={username}
                    onChange={event => setUsername(event.target.value)}
                />
                <input
                    type="password"
                    placeholder='Password'
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                />
            </div>
            <div className={styles.signOptions}>
                <button onClick={signUp}>Sign Up</button>
                <button onClick={signIn} disabled={btnSignInDisable}>Login</button>
            </div>
            <div className={styles.signWarning + (warning.show ? " " + styles.signWarning__unhide : "")}>
                <button onClick={() => setWarning({ show: false, message: "" })}>x</button>
                <span>{warning.message}</span>
            </div>
        </div>
        :
        <>
            <button onClick={signOut}>Sign Out</button>
        </>
    )
}

export default Authentication