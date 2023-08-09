import React, { useContext, useEffect, useState } from 'react'
import { AppStateCtx } from '../../pages'
import { Socket } from 'socket.io-client'
import getSocket from '../../src/utils/socket'
import mongoose from 'mongoose'

import Image from 'next/image'
import MessageHistory from './MessageHistory'
import Messenger from './Messenger'

import { MessageDocument } from '../../src/models/message.model'
import styles from '../../styles/Messenger.module.css'

const MessengerView = (): JSX.Element => {

    const { state } = useContext(AppStateCtx)
    const [messages, setMessages] = useState<MessageDocument[]>([])
    const [socket, setSocket] = useState<Socket>(getSocket())

    // Get messages when a conversation is selected
    useEffect(() => {
        if (socket && state.convo) {
            socket.emit("joinRoom", state.convo.id, () => { })
            socket.on("roomMessage", newMessageHandler)
            return () => {
                socket.off("roomMessage", newMessageHandler)
                socket.emit("leaveRoom", state.convo?.id, () => { })
                setMessages([])
            }
        }
    }, [state.convo, socket])

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
                <Messenger convo_id={state.convo.id} socket={socket} />
            </> : <></>
            }
        </div>
    )

}

const RecipientGlance = ({ display_name }: { display_name: string }): JSX.Element => {
    return (
        <div className={styles["RecipientGlance"]}>
            <div className={styles["RecipientGlance__profilepic"]}>
                <Image

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