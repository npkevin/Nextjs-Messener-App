import React, { useContext, useEffect, useState } from 'react'
import { AppStateCtx } from '../../pages'

import ConversationView from './ConversationView'
import Messenger from './Messenger'

import styles from '../../styles/Messenger.module.css'
import { Socket } from 'socket.io-client'
import { MessageDocument } from '../../src/models/message.model'

const MessengerView = (props: { socket: Socket }): JSX.Element => {

    const { state } = useContext(AppStateCtx)
    const [messages, setMessages] = useState<MessageDocument[]>([])

    // Get messages when a conversation is selected
    useEffect(() => {
        if (props.socket && state.convo) {
            props.socket.emit("joinRoom", state.convo.id)
            props.socket.on("roomMessage", newMessageHandler)
            return () => {
                props.socket.off("roomMessage", newMessageHandler)
                props.socket.emit("leaveRoom", state.convo?.id)
                setMessages([])
            }
        }
    }, [state.convo])

    const newMessageHandler = (new_message_string: string) => {
        const message_doc = JSON.parse(new_message_string) as MessageDocument
        setMessages(prev_message_docs => [...prev_message_docs, message_doc])
    }

    return (
        <div className={styles.container}>
            {state.convo ? <>
                <StatusView display_name={`${state.convo.user.name.first} ${state.convo.user.name.last}`.toUpperCase()} />
                <ConversationView sender_id={state.convo.user.id} history={state.convo.messages_history} messages={messages} />
                <Messenger convo_id={state.convo.id} socket={props.socket} />
            </> : <></>
            }
        </div>
    )

}

const StatusView = ({ display_name }: { display_name: string }): JSX.Element => {
    return (
        <div className={styles.recipient_container}>
            <img
                src="profile.png" alt=""
                draggable={false}
                onDragStart={e => e.preventDefault()} // Firefox support
            />
            <div className={styles.recipient}>
                <span className={styles.recipient__name}>{display_name}</span>
                {/* <span className={styles.recipient__status}>{"online"}</span> */}
            </div>
        </div>
    )
}

export default MessengerView