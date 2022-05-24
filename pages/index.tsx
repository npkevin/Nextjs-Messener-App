import type { NextPage } from 'next'
import cookies from 'js-cookie'
import SideMenu from '../components/SideMenu/SideMenu'
import MessengerView from '../components/Messenger/MessengerView'

import styles from '../styles/index.module.css'
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'
import { tUserInfo } from './api/auth'

type UserContextType = {

    jwt: JsonWebKey | string | null,
    setJwt: Dispatch<SetStateAction<JsonWebKey | string | null>>,
}

type ConvoContextType = {
    ID: string | null,
    setID: Dispatch<SetStateAction<string | null>>,
}

export const UserContext = createContext<UserContextType>({ jwt: null, setJwt: () => { } });
export const ConvoContext = createContext<ConvoContextType>({ ID: null, setID: () => { } });

// TODO: get oid from contacts... build a contacts system
const Home: NextPage = (): JSX.Element => {

    const user_ctx = useContext(UserContext);
    const [token, setToken] = useState<JsonWebKey | string | null>(null);
    const [convoID, setConvoID] = useState<string | null>(null);

    useEffect(() => {
        const validateJwt = async () => {
            const response: Response = await fetch("http://localhost:3000/api/authjwt", {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                },
            })
            if (response.status === 200) {

                const { jwt }: tUserInfo = await response.json();
                if (jwt !== undefined) { // Token was verified but expired... token refreshed
                    cookies.set('auth_jwt', jwt, { sameSite: 'strict', secure: true })
                    setToken(jwt);
                }
                else { // Token was verified, not expired
                    const token = cookies.get('auth_jwt') ? cookies.get('auth_jwt') as JsonWebKey : null
                    setToken(token);
                }


            } else {
                cookies.remove('auth_jwt');
                setToken(null);
            }
        }

        if (cookies.get('auth_jwt') && !token) {
            setToken("Validating");
            validateJwt();
        }
    });

    return (
        <div className={styles.container}>
            <UserContext.Provider value={{ jwt: token, setJwt: setToken }}>
                <ConvoContext.Provider value={{ ID: convoID, setID: setConvoID }}>
                    <SideMenu />
                    <MessengerView />
                </ConvoContext.Provider>
            </UserContext.Provider>
        </div>
    )
}

export default Home
