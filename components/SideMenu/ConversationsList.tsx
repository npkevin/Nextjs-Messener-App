import { ObjectId } from "mongodb"
import { useContext, useEffect, useState } from "react"
import { AppContext } from "../../pages"

import styles from '../../styles/SideMenu.module.css'
import { tMessage } from "../Messenger/ConversationView"

type Status = {
    loading: boolean
    complete: boolean
}

type participant = {
    display_name: string,
    oid: ObjectId
}

type Conversation = {
    _id: string,
    messages: tMessage[],
    participants: participant[]
}

const ConversationList = (props: any): JSX.Element => {

    const app_ctx = useContext(AppContext)
    const [status, setStatus] = useState<Status>({ loading: false, complete: false })
    const [search, setSearch] = useState<string>("")
    const [convoList, setConvoList] = useState<Conversation[]>([])
    const [timerID, setTimerID] = useState<NodeJS.Timeout>()

    useEffect(() => {
        if (!app_ctx.state.jwt || !app_ctx.state.user_oid) return

        if (!status.loading && !status.complete && convoList.length < 1) {
            searchConvos("").then(convos => {
                if (convos !== null)
                    setConvoList(convos)
            })
        }
    })

    const searchDelayed = (search_string: string, delay_ms: number) => {
        setSearch(search_string)
        if (timerID !== undefined) window.clearTimeout(timerID)

        if (search_string) {
            setTimerID(setTimeout(() => searchConvos(search_string), delay_ms))
        }
    }

    const searchConvos = async (search_string: string): Promise<Conversation[] | null> => {
        const params: URLSearchParams = new URLSearchParams();
        params.append("convo_oid", app_ctx.state.user_oid as string)
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

    return app_ctx.state.jwt ? (
        <div className={styles.convo_container}>
            <div className={styles.user_card}>
                <div className={styles.user_pic_container}>
                    <img
                        src="profile.png" alt=""
                        draggable={false}
                        onDragStart={e => e.preventDefault()} // Firefox support
                    />
                </div>
                <div className={styles.user_status_container}>
                    <span>{app_ctx.state.display_name}</span>
                    <span>Online</span>
                </div>
            </div>
            <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={e => searchDelayed(e.target.value, 1000)}
            />
            <ul className={styles.convo_list}>
                {convoList.map(convo => {
                    return (
                        <li className={styles.convo} onClick={() => app_ctx.state.convo_id = convo._id}>
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