import type { NextPage } from 'next'
import cookies from 'js-cookie'
import SideMenu from '../components/SideMenu/SideMenu'
import MessengerView from '../components/Messenger/MessengerView'

import styles from '../styles/index.module.css'
import { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Types } from 'mongoose'
import { io, Socket } from 'socket.io-client'
import { MessageDocument } from '../src/models/message.model'
import getConfig from 'next/config'

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

    const [socket, setSocket] = useState<Socket>()

    useEffect(() => {
        const checkToken = async (token: string) => {
            const response = await fetch(`/api/auth`)

            if (!response.ok) cookies.remove("token")
            else {
                const response_json = await response.json()
                setState({ validToken: true, user: { name: response_json.name } })
            }
        }
        const token = cookies.get("token")
        if (token && !state.validToken) {
            checkToken(token)
        }

        if (!socket) {
            const { SOCKETIO_URI } = getConfig().publicRuntimeConfig;
            setSocket(io(SOCKETIO_URI, { path: "/socketio/socket.io" }));
        }

        return () => {
            if (socket) socket.disconnect()
        }
    }, [])

    return (
        <AppStateCtx.Provider value={{ state, setState }}>
            <div className={styles.container}>
                <SideMenu />
                {socket ? <MessengerView socket={socket} /> : null}
            </div>
        </AppStateCtx.Provider>
    )
}

export default Home
