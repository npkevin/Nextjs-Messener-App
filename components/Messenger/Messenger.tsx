import { useState } from 'react'

import TextareaAutosize from 'react-textarea-autosize'
import styles from '../../styles/Messenger.module.css'

const Messenger = (): JSX.Element => {

    const [draft, setDraft] = useState("")

    const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const response: Response = await fetch("http://localhost:3000/api/conv?", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                message: draft
            })
        })
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