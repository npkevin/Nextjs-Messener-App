import { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import styles from '../../styles/Messenger.module.css'
import { tMessage } from './ConversationView'

type MessengerProps = { oid: string, addMessage: (message: tMessage) => void }

const Messenger = ({ oid, addMessage }: MessengerProps): JSX.Element => {

    const [draft, setDraft] = useState("")

    const sendMessage = async (event: React.FormEvent<HTMLFormElement>, message: string) => {
        event.preventDefault()
        try {
            const params: URLSearchParams = new URLSearchParams()
            params.append("convo_oid", oid)

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
                const json: tMessage = await response.json()
                addMessage(json)
            }

        } catch (err) {
            console.error(err)
        }
    }

    return (
        <form className={styles.messageSender} onSubmit={event => sendMessage(event, draft)}>
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