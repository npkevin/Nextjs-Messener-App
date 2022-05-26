import { useContext, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { ConvoContext } from '../../pages'

import styles from '../../styles/Messenger.module.css'

type MessengerProps = { oid: string }

const Messenger = ({ oid }: MessengerProps): JSX.Element => {

    const [draft, setDraft] = useState("")

    const sendMessage = async (event: React.FormEvent<HTMLFormElement>, message: string) => {
        event.preventDefault()
        try {
            const params: URLSearchParams = new URLSearchParams()
            params.append("convo_oid", oid)

            const response: Response = await fetch("http://localhost:3000/api/conv?" + params.toString(), {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ message: draft })
            })
            // TODO: Cute animations while sending...

        } catch (err) {
            console.error(err)
        }
    }

    return (
        <form className={styles.messageSender} onSubmit={(event) => sendMessage(event, draft)}>
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