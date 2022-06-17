import type { NextPage } from 'next'
import cookies from 'js-cookie'
import SideMenu from '../components/SideMenu/SideMenu'
import MessengerView from '../components/Messenger/MessengerView'

import styles from '../styles/index.module.css'
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'
import { SignInResponse } from './api/auth'
import { ConvoObj } from './api/conv'
import { ObjectId } from 'mongodb'

type AppStatetype = {
    convo: ConvoObj,
    user_oid: ObjectId | null,
    display_name: string,
    jwt?: string,
}

const defaultAppState: AppStatetype = {
    convo: null,
    user_oid: null,
    display_name: '',
}

type AppContextType = {
    state: AppStatetype,
    setState: Dispatch<SetStateAction<AppStatetype>>,
}

export const AppContext = createContext<AppContextType>({ state: defaultAppState, setState: () => { } })

const Home: NextPage = (): JSX.Element => {

    const [appState, setAppState] = useState<AppStatetype>(defaultAppState)

    useEffect(() => {
        if (cookies.get('auth_jwt'))
            verifyJwtCookie()
    }, [])

    const verifyJwtCookie = async () => {
        const response: Response = await fetch("http://localhost:3000/api/authjwt", {
            method: "GET",
            headers: {
                "content-type": "application/json"
            },
        })
        if (response.status === 200) {

            const { user_oid, display_name, jwt }: SignInResponse = await response.json()
            // Token was verified but expired... token refreshed
            if (jwt) {
                cookies.set('auth_jwt', jwt, { sameSite: 'strict', secure: true })
                setAppState({
                    convo: null,
                    user_oid: user_oid,
                    display_name: display_name,
                    jwt: jwt,
                })
            }
            // Token was verified, not expired
            else {
                setAppState({
                    convo: null,
                    user_oid: user_oid,
                    display_name: display_name,
                    jwt: cookies.get('auth_jwt'),
                })
            }
        } else {
            cookies.remove('auth_jwt')
            setAppState({
                convo: null,
                user_oid: null,
                display_name: "",
            })
        }
    }

    console.log("RENDER INDEX")

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
