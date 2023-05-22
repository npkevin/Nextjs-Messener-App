import React, { useContext, useEffect, useState } from 'react'
import { AppStateCtx } from '../../pages'

import ConversationView from './ConversationView'
import Messenger from './Messenger'

import styles from '../../styles/Messenger.module.css'

const MessengerView = (): JSX.Element => {

    const { state, setState } = useContext(AppStateCtx)
    // const [messages, setMessages] = useState<Message[]>([])

    // Get messages when a conversation is selected
    // useEffect(() => {
    // }, [])

    // if (!state.convoSelected)
    //     return <div className={styles.container} />

    return (
        <div className={styles.container}>
            <StatusView display_name={"TEST"} />
            <ConversationView messages={null} />
            <Messenger />
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