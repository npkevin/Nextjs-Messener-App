import { useState } from 'react'

import TextareaAutosize from 'react-textarea-autosize'
import styles from '../../styles/Messenger.module.css'
import { Types } from 'mongoose'
import { Socket } from 'socket.io-client'

const Messenger = (props: { convo_id: Types.ObjectId, socket: Socket }): JSX.Element => {

    const [draft, setDraft] = useState("")

    const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        props.socket.emit("roomMessage", props.convo_id.toString(), draft)
        setDraft("")
    }

    return (
        <form className={styles.messageSender} onSubmit={sendMessage}>
            <TextareaAutosize
                onChange={(event) => setDraft(event.target.value)}
                value={draft}
                minRows={1}
                maxRows={3}
            />
            <button type='submit' disabled={draft === ""}>Send</button>
        </form>
    )
}

export default Messenger