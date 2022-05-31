import { ObjectId } from "mongodb"
import { useContext, useEffect, useState } from "react"
import { clearTimeout } from "timers"
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
    const [timerID, setTimerID] = useState<NodeJS.Timeout>()

    useEffect(() => {

        if (user_ctx.jwt === null || user_ctx.jwt === '') return

        if (!status.loading && !status.complete && convoList.length < 1) {
            searchConvos("").then(convos => {
                if (convos !== null)
                    setConvoList(convos)
            })
        }
    })

    const searchTimer = (search_string: string) => {
        setSearch(search_string)
        if (timerID !== undefined) window.clearTimeout(timerID)

        if (search_string) {
            setTimerID(setTimeout(() => searchConvos(search_string), 1000))
        }
    }

    const searchConvos = async (search_string: string): Promise<Conversation[] | null> => {
        const params: URLSearchParams = new URLSearchParams();
        params.append("search", search_string)

        try {
            setStatus({ loading: true, complete: false })
            const fetch_response: Response = await fetch("http://localhost:3000/api/conv?" + params.toString())
            setStatus({ loading: false, complete: true })

            if (fetch_response.status == 200) {
                const jsonRespnse: Conversation[] = await fetch_response.json()
                return jsonRespnse
            }

            if (fetch_response.status == 500) {
                console.error(500)
            }
        }
        catch (err) {
            console.error(err)
        }

        // all else
        return null
    }

    return user_ctx.jwt ? (
        <div className={styles.convo_container}>
            <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={e => searchTimer(e.target.value)}
            />
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