import type { NextPage } from 'next'
import cookies from 'js-cookie'
import SideMenu from '../components/SideMenu/SideMenu'
import MessengerView from '../components/Messenger/MessengerView'

import styles from '../styles/index.module.css'
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'
import { SignInResponse } from './api/auth'
import { ObjectID } from 'bson'

type AppStatetype = {
    user_oid: ObjectID | string | null,
    display_name: string,
    jwt: JsonWebKey | string | null,
    convo_id: ObjectID | string | null,
}

type AppContextType = {
    state: AppStatetype,
    setState: Dispatch<SetStateAction<AppStatetype>>,
}

export const AppContext = createContext<AppContextType>({ state: { user_oid: null, display_name: "", jwt: null, convo_id: "" }, setState: () => { } })

const Home: NextPage = (): JSX.Element => {

    const [appState, setAppState] = useState<AppStatetype>({ user_oid: null, display_name: "", jwt: null, convo_id: "" })

    useEffect(() => {
        const validateJwt = async () => {
            const response: Response = await fetch("http://localhost:3000/api/authjwt", {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                },
            })
            if (response.status === 200) {

                const { user_oid, display_name, jwt }: SignInResponse = await response.json()
                if (jwt !== undefined) { // Token was verified but expired... token refreshed
                    cookies.set('auth_jwt', jwt, { sameSite: 'strict', secure: true })
                    setAppState({
                        ...appState,
                        user_oid: user_oid,
                        display_name: display_name,
                        jwt: jwt,
                    })
                } else { // Token was verified, not expired
                    const token = cookies.get('auth_jwt') ? cookies.get('auth_jwt') as JsonWebKey : null
                    setAppState({
                        ...appState,
                        user_oid: user_oid,
                        display_name: display_name,
                        jwt: token,
                    })
                }


            } else {
                cookies.remove('auth_jwt')
                setAppState({
                    ...appState,
                    user_oid: null,
                    display_name: "",
                    jwt: null,
                })
            }
        }

        if (cookies.get('auth_jwt') && !appState.jwt) {
            setAppState({
                ...appState,
                jwt: "Validating",
            })
            validateJwt()
        }
    })

    return (
        <div className={styles.container}>
            <AppContext.Provider value={{ state: appState, setState: setAppState }}>
                <SideMenu />
                <MessengerView />
            </AppContext.Provider>
        </div>
    )
}

export default Home
