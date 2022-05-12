import React, { useContext, useEffect, useState } from 'react'
import Messenger from './Messenger'
import ConversationView from './ConversationView'
import { ConvoContext } from '../../pages'
import styles from '../../styles/Messenger.module.css'

const MessengerView = (): JSX.Element => {

    const convo_ctx = useContext(ConvoContext);
    const [messages, setMessages] = useState([])

    useEffect(() => {

        if (!convo_ctx.ID) return

        const params: URLSearchParams = new URLSearchParams()
        params.append("oid", convo_ctx.ID)

        if (messages.length === 0) {
            try {
                fetch("http://localhost:3000/api/conv?" + params.toString())
                    .then((fetch_response: Response) => {
                        if (fetch_response.status == 200) {
                            fetch_response.json().then((value) => {
                                setMessages(value.messages)
                            })
                        }
                        else {
                            // TODO: 500 internal server error handle
                            console.error(fetch_response)
                        }
                    })
            }
            catch (err) {
                console.error(err)
            }
        }
        // unmount:
        // return () => {} CLEANUP
    })

    if (!convo_ctx.ID) return (
        <div className={styles.container} />
    )

    return (
        <div className={styles.container}>
            <StatusView />
            <ConversationView messages={messages} />
            <Messenger oid={convo_ctx.ID} />
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

export default MessengerView;