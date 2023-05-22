import type { NextPage } from 'next'
import cookies from 'js-cookie'
import SideMenu from '../components/SideMenu/SideMenu'
import MessengerView from '../components/Messenger/MessengerView'

import styles from '../styles/index.module.css'
import { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react'

interface IdefaultState {
    validToken: boolean
    user: {
        name: {
            first: string,
            last: string,
            middle: string,
        }
    } | undefined
}
const defaultState: IdefaultState = {
    validToken: false,
    user: undefined
}
interface IAppState { state: IdefaultState, setState: Dispatch<SetStateAction<IdefaultState>> }
export const AppStateCtx = createContext<IAppState>({ state: defaultState, setState: () => undefined })

const Home: NextPage = (): JSX.Element => {
    const [state, _setState] = useState(defaultState)
    const setState = (new_state: {}) => _setState(prev_state => ({ ...prev_state, ...new_state }))


    useEffect(() => {
        const checkToken = async (token: string) => {
            const response = await fetch("http://localhost:3000/api/auth", { method: "GET" })

            if (!response.ok) cookies.remove("token")
            else {
                const response_json = await response.json()
                setState({ validToken: true, user: { name: response_json.name } })
            }
        }
        const token = cookies.get("token")
        if (token && !state.validToken)
            checkToken(token)
        return // () =>{ clean-up code}
    }, [])

    return (
        <AppStateCtx.Provider value={{ state, setState }}>
            <div className={styles.container}>
                <SideMenu />
                <MessengerView />
            </div>
        </AppStateCtx.Provider>
    )
}

export default Home
