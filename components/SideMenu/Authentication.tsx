import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../pages'
import cookies from 'js-cookie'

import styles from '../../styles/Authentication.module.css'
import { tUserInfo } from '../../pages/api/auth'

const Authentication = (): JSX.Element => {

    const user_ctx = useContext(UserContext);

    const [username, setUsername] = useState<string | undefined>("");
    const [password, setPassword] = useState<string | undefined>("");
    const [btnDisable, setBtnDisable] = useState<boolean>(false);

    useEffect(() => {
        setBtnDisable(!username || !password);
    });

    const login = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
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
                })
            })

            if (response.status === 200) {
                const result: tUserInfo = await response.json();
                const jwt: string = result.jwt as string
                cookies.set('auth_jwt', jwt, { sameSite: 'strict', secure: true })
                user_ctx.setJwt(jwt);
            } else {
                user_ctx.setJwt(null);
            }
        } catch (err) {
            console.error(err)
            signOut();
        }
    }

    const signOut = () => {
        cookies.remove('auth_jwt');
        user_ctx.setJwt(null);
        setUsername("");
        setPassword("");
    }

    // Render
    return (!user_ctx.jwt ?
        <form className={styles.container} onSubmit={login}>
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
            <span style={{ fontSize: 10, color: user_ctx.jwt === 'Validating' ? 'yellow' : 'green' }}>
                {user_ctx.jwt}
            </span>
        </>
    )
}

export default Authentication