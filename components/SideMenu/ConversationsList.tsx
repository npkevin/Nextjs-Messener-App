import { ObjectId } from "mongodb"
import { useContext, useEffect, useState } from "react"
import { AppContext } from "../../pages"
import { Conversation, ConvoObj } from '../../pages/api/conv'

import styles from '../../styles/SideMenu.module.css'

type Status = {
    loading: boolean
    complete: boolean
}

type Person = {
    _id: ObjectId,
    firstname: string,
    lastname: string,
}

const ConversationList = (): JSX.Element => {

    const app_ctx = useContext(AppContext)
    const [status, setStatus] = useState<Status>({ loading: false, complete: false })
    const [search, setSearch] = useState<string>("")
    const [searchList, setSearchList] = useState<Person[]>([])
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

    // Search by Name
    const searchDelayed = (search_string: string, delay_ms: number) => {
        setSearch(search_string)
        if (timerID !== undefined) window.clearTimeout(timerID)

        if (search_string) {
            setTimerID(setTimeout(
                () => {
                    searchConvos(search_string).then((result: Person[]) => {
                        setSearchList(result)
                    })
                },
                delay_ms
            ))
        }
    }

    const searchConvos = async (search_string: string) => {
        const params: URLSearchParams = new URLSearchParams();
        params.append("search", search_string)

        try {
            setStatus({ loading: true, complete: false })
            const fetch_response: Response = await fetch("http://localhost:3000/api/conv?" + params.toString())
            const json_respnse = await fetch_response.json()
            setStatus({ loading: false, complete: true })

            if (fetch_response.status == 200) {
                return json_respnse
            }
        }
        catch (err) {
            console.error(err)
        }

        // all else
        return null
    }

    const switchConvo = (convo_obj: ConvoObj) => {
        app_ctx.setState({
            ...app_ctx.state,
            convo: convo_obj
        })
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
                placeholder="Search by Name"
                value={search}
                onChange={e => searchDelayed(e.target.value, 1000)}
            />
            <ul className={styles.convo_list}>
                {searchList.map(person => {
                    return (
                        <li className={styles.convo}
                            key={person._id.toString()}
                            onClick={() => switchConvo({ convo_oid: null, recipient_oid: person._id })}
                        >
                            <div className={styles.profile_pic}>
                                <img src="profile.png" alt="" />
                            </div>
                            <div className={styles.glance}>
                                <span>{person.firstname + " " + person.lastname}</span>
                                <span>Offline</span>
                            </div>
                        </li>
                    )
                })}
                {convoList.map(convo => {
                    return (
                        <li className={styles.convo}
                            key={convo.oid.toString()}
                            onClick={() => switchConvo({ convo_oid: convo.oid, recipient_oid: null })}
                        >
                            <div className={styles.profile_pic}>
                                <img
                                    src="profile.png" alt=""
                                    draggable={false}
                                    onDragStart={e => e.preventDefault()} // Firefox support
                                />
                            </div>
                            <div className={styles.glance}>
                                <span>{convo.oid.toString()}</span>
                                <span>{convo.messages[convo.messages.length - 1].value}</span>
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