import { ObjectId } from "mongodb"
import { getDisplayName } from "next/dist/shared/lib/utils"
import { useContext, useEffect, useState } from "react"
import { AppContext } from "../../pages"
import { Conversation, participant } from '../../pages/api/conv'

import styles from '../../styles/SideMenu.module.css'

type Person = {
    _id: ObjectId,
    firstname: string,
    lastname: string,
}

export const getDisplayname = (id: ObjectId, participants: participant[]): string => {
    let display_name: string = ""
    participants.forEach(p => {
        if (id != p.user_oid)
            display_name = p.display_name
    })
    return display_name
}

const ConversationList = (): JSX.Element => {

    const app_ctx = useContext(AppContext)

    const [searchList, setSearchList] = useState<Person[]>([])
    const [convoList, setConvoList] = useState<Conversation[]>([])

    const [search, setSearch] = useState<string>("")
    const [timerID, setTimerID] = useState<NodeJS.Timeout>()

    useEffect(() => {
        searchConvos("").then(convos => {
            if (convos !== null)
                setConvoList(convos)
        })
    }, [])

    // Search by Name
    const searchDelayed = (search_string: string, delay_ms: number) => {
        setSearch(search_string)
        if (timerID) window.clearTimeout(timerID)

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
            const fetch_response: Response = await fetch("http://localhost:3000/api/conv?" + params.toString())
            const json_respnse = await fetch_response.json()

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

    const switchConvo = (convoId: ObjectId | null, recipId: ObjectId | null) => {
        app_ctx.setState({
            ...app_ctx.state,
            convo: {
                convo_oid: convoId,
                recipient_oid: recipId,
            }
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
                            onClick={() => switchConvo(null, person._id)}
                        >
                            <div className={styles.profile_pic}>
                                <img src="profile.png" alt="" />
                            </div>
                            <div className={styles.glance}>
                                <span>{`${person.firstname} ${person.lastname}`}</span>
                                <span>Offline</span>
                            </div>
                        </li>
                    )
                })}
                {convoList.map(convo => {
                    return (
                        <li className={styles.convo}
                            key={convo.oid.toString()}
                            onClick={() => switchConvo(convo.oid, null)}
                        >
                            <div className={styles.profile_pic}>
                                <img
                                    src="profile.png" alt=""
                                    draggable={false}
                                    onDragStart={e => e.preventDefault()} // Firefox support
                                />
                            </div>
                            <div className={styles.glance}>
                                {
                                    app_ctx.state.user_oid ?
                                        <span>{getDisplayname(app_ctx.state.user_oid, convo.participants)}</span>
                                        :
                                        <span>{""}</span>
                                }
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