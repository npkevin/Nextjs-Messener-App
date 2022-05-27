import { ObjectId } from "mongodb"
import { FormEvent, useContext, useEffect, useState } from "react"
import { UserContext, ConvoContext } from "../../pages"

import styles from '../../styles/SideMenu.module.css'
import { tMessage } from "../Messenger/ConversationView"

type Status = {
    loading: boolean
    complete: boolean
}

type Conversation = {
    _id: string,
    messages: tMessage[],
    participants: ObjectId[]
}

const ConversationList = (props: any): JSX.Element => {

    const user_ctx = useContext(UserContext)
    const convo_ctx = useContext(ConvoContext)
    const [status, setStatus] = useState<Status>({ loading: false, complete: false })
    const [search, setSearch] = useState<string>("")
    const [convoList, setConvoList] = useState<Conversation[]>([])

    useEffect(() => {

        if (user_ctx.jwt === null || user_ctx.jwt === '') return

        const getConvos = async (): Promise<Conversation[] | null> => {
            setStatus({ loading: true, complete: false })
            try {
                const fetch_response: Response = await fetch("http://localhost:3000/api/conv?search=")

                if (fetch_response.status == 200) {
                    const jsonRespnse = await fetch_response.json()
                    return jsonRespnse
                }

                if (fetch_response.status == 500) {
                    console.log(500)
                }
            }
            catch (err) {
                console.error(err)
            }

            // else
            return null
        }

        if (!status.loading && !status.complete && convoList.length < 1) {
            setStatus({ loading: true, complete: false })
            getConvos().then(convos => {
                setStatus({ loading: false, complete: true })
                if (convos !== null)
                    setConvoList(convos)
            })
        }
    })

    const findContact = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        console.log(search)
    }

    return user_ctx.jwt ? (
        <div className={styles.convo_container}>
            <form onSubmit={findContact}>
                <input
                    type="text"
                    placeholder="Search Contact"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </form>
            <ul className={styles.convo_list}>
                {convoList.map(convo => {
                    return (
                        <li className={styles.convo} onClick={() => convo_ctx.setID(convo._id)}>
                            <div className={styles.profile_pic}>
                                <img src="" alt="" />
                            </div>
                            <div className={styles.glance}>
                                <span>{convo._id}</span>
                                <span>---------</span>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    ) : (
        <></>
    )
}

export default ConversationList