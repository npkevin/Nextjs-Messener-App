import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../pages'
import cookies from 'js-cookie'

import styles from '../../styles/Authentication.module.css'
import { tUserInfo } from '../../pages/api/auth'

const Authentication = (): JSX.Element => {

    let app_ctx = useContext(AppContext)

    const [username, setUsername] = useState<string | undefined>("")
    const [password, setPassword] = useState<string | undefined>("")
    const [firstName, setFirstName] = useState<string | undefined>("")
    const [lastName, setLastName] = useState<string | undefined>("")
    const [btnDisable, setBtnDisable] = useState<boolean>(false)

    useEffect(() => {
        setBtnDisable(!username || !password)
    })

    const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (cookies.get('auth_jwt')) return
        try {
            const response: Response = await fetch("http://localhost:3000/api/auth", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    firstName: firstName,
                    lastName: lastName,
                })
            })

            if (response.status === 200) {
                const result: tUserInfo = await response.json()
                const jwt: string = result.jwt as string
                cookies.set('auth_jwt', jwt, { sameSite: 'strict', secure: true })
                // app_ctx.display_name = result.display_name
                // app_ctx.jwt = jwt
                app_ctx.setState({
                    ...app_ctx.state,
                    display_name: result.display_name,
                    jwt: jwt
                })
            } else {
                // app_ctx.display_name = ""
                // app_ctx.jwt = null
                app_ctx.setState({
                    ...app_ctx.state,
                    display_name: "",
                    jwt: null
                })
            }
        } catch (err) {
            console.error(err)
            signOut()
        }
    }

    const signOut = () => {
        setUsername("")
        setPassword("")
        cookies.remove('auth_jwt')
        // app_ctx.display_name = ""
        // app_ctx.jwt = null
        app_ctx.setState({
            ...app_ctx.state,
            display_name: "",
            jwt: null
        })
    }

    // Render
    return (!app_ctx.state.jwt ?
        <form className={styles.container} onSubmit={signIn}>
            <input
                type="text"
                placeholder='First name'
                value={firstName}
                onChange={event => setFirstName(event.target.value)}
            />
            <input
                type="text"
                placeholder='Last name'
                value={lastName}
                onChange={event => setLastName(event.target.value)}
            />
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
            <button type="submit" disabled={btnDisable}>Login</button>
        </form>
        :
        <>
            <button onClick={signOut}>Sign Out</button>
            <span style={{ fontSize: 10, color: app_ctx.state.jwt === 'Validating' ? 'yellow' : 'green' }}>
                {app_ctx.state.jwt}
            </span>
        </>
    )
}

export default Authentication