import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../pages'
import ConversationView, { tMessage } from './ConversationView'
import Messenger from './Messenger'

import styles from '../../styles/Messenger.module.css'

const MessengerView = (): JSX.Element => {

    const app_ctx = useContext(AppContext)
    const [messages, setMessages] = useState<tMessage[]>([])

    useEffect(() => {
        if (app_ctx.state.convo_id === "") return

        const params: URLSearchParams = new URLSearchParams()
        params.append("convo_oid", app_ctx.state.convo_id)

        const getMessages = async () => {
            if (messages.length === 0) {
                try {
                    const fetch_response: Response = await fetch("http://localhost:3000/api/conv?" + params.toString())

                    if (fetch_response.status == 200) {
                        const value = await fetch_response.json()
                        setMessages(value.messages)
                    }

                    if (fetch_response.status == 500) {
                        // TODO: 500 internal server error handle
                        const value = await fetch_response.json()
                        console.error(value)
                    }
                }
                catch (err) {
                    console.error(err)
                }
            }
        }

        getMessages()
        // unmount:
        // return () => {} CLEANUP
    })

    const addToMessageState = (new_message: tMessage) => {
        setMessages([
            ...messages,
            new_message,
        ])
    }

    if (!app_ctx.state.convo_id) return <div className={styles.container} />

    return (
        <div className={styles.container}>
            <StatusView />
            <ConversationView messages={messages} />
            <Messenger oid={app_ctx.state.convo_id} addMessage={addToMessageState} />
        </div>
    )
}

const StatusView = (): JSX.Element => {
    return (
        <div className={styles.recipient_container}>
            <img
                src="profile.png" alt=""
                draggable={false}
                onDragStart={e => e.preventDefault()} // Firefox support
            />
            <div className={styles.recipient}>
                <span className={styles.recipient__name}>Jane Doe</span>
                <span className={styles.recipient__status}>{"online"}</span>
            </div>
        </div>
    )
}

export default MessengerView