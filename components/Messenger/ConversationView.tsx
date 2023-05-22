import React from 'react'
import { Message } from '../../pages/api/conv'


import styles from '../../styles/Messenger.module.css'

type Props = { messages: Message[] }


// TODO: add keys as message id from mongodb
const ConversationView = ({ messages }: Props): JSX.Element => {

    if (messages)
        messages.sort((a: Message, b: Message) => {
            console.log(a, b)
            const date_a = a.posted.getTime()
            const date_b = b.posted.getTime()
            return date_a - date_b
        })

    return (
        <div className={styles.messageHistory}>
            {messages ? messages.map((message, index) => <Message key={index} message={message} />) : null}
        </div>
    )
}

const Message = (props: { message: Message }): JSX.Element => {
    // TODO:
    // - Add Dates (posted/updated)
    // - Read Status
    return (
        <div className={styles.message + (props.message.sender ? (" " + styles.message_sent) : " ")}>
            <span>
                {props.message.value}
            </span>
        </div>
    )
}

export default ConversationView