import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../pages'

import ConversationView from './ConversationView'
import Messenger from './Messenger'
import { Message } from '../../pages/api/conv'

import styles from '../../styles/Messenger.module.css'
import { ObjectId } from 'mongodb'

const MessengerView = (): JSX.Element => {

    const app_ctx = useContext(AppContext)
    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        const getMessages = async () => {
            if (!app_ctx.state.convo) return

            if (app_ctx.state.convo.convo_oid) {
                const params: URLSearchParams = new URLSearchParams()
                params.append("convo_oid", app_ctx.state.convo.convo_oid.toString())

                const fetch_response: Response = await fetch("http://localhost:3000/api/conv?" + params.toString())
                const value = await fetch_response.json()

                if (fetch_response.status == 200) {
                    setMessages(value.messages)
                }
                // No Conversation exists
                if (fetch_response.status == 404) {
                    setMessages([])
                }
            }
            else if (app_ctx.state.convo.recipient_oid) {
                setMessages([])
            }
        }

        getMessages()
        // unmount:
        // return () => {} CLEANUP
    }, [app_ctx.state.convo])

    const addToMessageState = (new_message: Message) => {
        if (messages === null) return
        setMessages([
            ...messages,
            new_message,
        ])
    }

    if (!app_ctx.state.convo)
        return <div className={styles.container} />

    const StatusView = (): JSX.Element => {
        return (
            <div className={styles.recipient_container}>
                <img
                    src="profile.png" alt=""
                    draggable={false}
                    onDragStart={e => e.preventDefault()} // Firefox support
                />
                <div className={styles.recipient}>
                    <span className={styles.recipient__name}>{app_ctx.state.convo?.convo_oid}</span>
                    <span className={styles.recipient__status}>{"online"}</span>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <StatusView />
            <ConversationView messages={messages} />
            <Messenger
                convo_obj={app_ctx.state.convo}
                addMessage={addToMessageState}
            />
        </div>
    )
}

export default MessengerView