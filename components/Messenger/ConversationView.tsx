import React from 'react'

import styles from '../../styles/Messenger.module.css'
import { MessageDocument } from '../../src/models/message.model'



// TODO: add keys as message id from mongodb
const ConversationView = ({ messages }: { messages: MessageDocument[] }): JSX.Element => {
    return (
        <div className={styles.messageHistory}>
            {messages.map(message =>
                <Message key={message._id.toString()} content={message.content} date={message.updatedAt} />)
            }
        </div>
    )
}

const Message = ({ content, date }: { content: string, date: Date }): JSX.Element => {
    // TODO:
    // - Add Dates (posted/updated)
    // - Read Status
    return (
        <div className={styles.message}> {/* className={styles.message + (props.message.sender ? (" " + styles.message_sent) : " ")} */}
            <span>
                {content}
            </span>
        </div>
    )
}

export default ConversationView