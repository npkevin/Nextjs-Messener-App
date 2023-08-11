import type { NextPage } from 'next'
import { createContext, useEffect, useState } from 'react'
import cookies from 'js-cookie'

import SideMenu from '../src/components/SideMenu/SideMenu'
import MessengerView from '../src/components/Messenger/MessengerView'
import styles from '../styles/index.module.css'

import { Types } from 'mongoose'
import { MessageDocument } from '../src/models/message.model'

interface IdefaultState {
    validToken: boolean
    user?: {
        name: {
            first: string,
            last: string,
            middle: string,
        }
    },
    convo?: {
        id: Types.ObjectId,
        user: {
            id: Types.ObjectId,
            name: {
                first: string,
                last: string,
                middle: string,
            }
        },
        messages_history: MessageDocument[]
    }
}
const defaultState: IdefaultState = {
    validToken: false,
    user: undefined,
    convo: undefined,
}

interface IAppState { state: IdefaultState, setState: (new_state: {}) => void }
export const AppStateCtx = createContext<IAppState>({ state: defaultState, setState: () => undefined })


const Home: NextPage = (): JSX.Element => {
    const [state, _setState] = useState(defaultState)
    const setState = (new_state: {}) => _setState(prev_state => ({ ...prev_state, ...new_state }))

    useEffect(() => {
        const checkCookieToken = async () => {
            const response = await fetch(`/api/auth`)

            if (!response.ok) cookies.remove("token")
            else {
                const response_json = await response.json()
                setState({ validToken: true, user: { name: response_json.name } })
            }
        }
        const token = cookies.get("token")
        if (token && !state.validToken) {
            checkCookieToken()
        }

        return () => {
            // cleanup
        }
    }, [state.validToken])

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
