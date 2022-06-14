import { useState } from 'react'
import { ObjectId } from 'mongodb'
import { Message } from '../../pages/api/conv'

import TextareaAutosize from 'react-textarea-autosize'
import styles from '../../styles/Messenger.module.css'

type MessengerProps = {
    convo_obj: {
        convo_oid: ObjectId | null,
        recipient_oid: ObjectId | null,
    },
    addMessage: (message: Message) => void
}

const Messenger = ({ convo_obj, addMessage }: MessengerProps): JSX.Element => {

    const [draft, setDraft] = useState("")

    const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            const params: URLSearchParams = new URLSearchParams()
            params.append("convo_obj", JSON.stringify(convo_obj))

            const sent_message = draft
            setDraft("")
            const response: Response = await fetch("http://localhost:3000/api/conv?" + params.toString(), {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ message: sent_message })
            })
            // TODO: Cute animations while sending...
            if (response.status == 201) {
                const json: Message = await response.json()
                addMessage(json)
            }

        } catch (err) {
            console.error(err)
        }
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