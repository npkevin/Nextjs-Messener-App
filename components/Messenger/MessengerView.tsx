import React, { useContext, useEffect, useState } from 'react'
import { AppStateCtx } from '../../pages'
import { Socket } from 'socket.io-client'
import mongoose from 'mongoose'

import MessageHistory from './MessageHistory'
import Messenger from './Messenger'

import { MessageDocument } from '../../src/models/message.model'
import styles from '../../styles/Messenger.module.css'

const MessengerView = (props: { socket: Socket }): JSX.Element => {

    const { state } = useContext(AppStateCtx)
    const [messages, setMessages] = useState<MessageDocument[]>([])

    // Get messages when a conversation is selected
    useEffect(() => {
        if (props.socket && state.convo) {
            props.socket.emit("joinRoom", state.convo.id, () => { })
            props.socket.on("roomMessage", newMessageHandler)
            return () => {
                props.socket.off("roomMessage", newMessageHandler)
                props.socket.emit("leaveRoom", state.convo?.id, () => { })
                setMessages([])
            }
        }
    }, [state.convo])

    const newMessageHandler = (new_message_string: string) => {
        let message_doc = JSON.parse(new_message_string) as MessageDocument
        message_doc.convo_id = new mongoose.Types.ObjectId(message_doc.convo_id)
        message_doc.sender_id = new mongoose.Types.ObjectId(message_doc.sender_id)
        message_doc.createdAt = new Date(message_doc.createdAt)
        message_doc.updatedAt = new Date(message_doc.updatedAt)
        setMessages(prev_message_docs => [message_doc, ...prev_message_docs])
    }

    return (
        <div className={styles.container}>
            {state.convo ? <>
                <RecipientGlance display_name={`${state.convo.user.name.first} ${state.convo.user.name.last}`.toUpperCase()} />
                <MessageHistory sender_id={state.convo.user.id} history={state.convo.messages_history} messages={messages} />
                <Messenger convo_id={state.convo.id} socket={props.socket} />
            </> : <></>
            }
        </div>
    )

}

const RecipientGlance = ({ display_name }: { display_name: string }): JSX.Element => {
    return (
        <div className={styles["RecipientGlance"]}>
            <div className={styles["RecipientGlance__profilepic"]}>
                <img

                    src="profile.png" alt=""
                    draggable={false}
                    onDragStart={e => e.preventDefault()} // Firefox support
                />
            </div>
            <div className={styles["RecipientGlance__about"]}>
                <span className={styles["RecipientGlance__displayName"]}>{display_name}</span>
                {/* <span className={styles["RecipientGlance__status"]}>{"online"}</span> */}
            </div>
        </div>
    )
}

export default MessengerView