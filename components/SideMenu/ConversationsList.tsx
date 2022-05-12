import { FormEvent, useContext, useEffect, useState } from "react"
import { UserContext, ConvoContext } from "../../pages";

import styles from '../../styles/SideMenu.module.css'

type Status = {
    loading: boolean;
    complete: boolean;
}

type Conversation = {
    oid: string,
}

const ConversationList = (props: any): JSX.Element => {

    const user_ctx = useContext(UserContext);
    const convo_ctx = useContext(ConvoContext);
    const [status, setStatus] = useState<Status>({ loading: false, complete: false });
    const [search, setSearch] = useState<string>("");
    const [convoList, setConvoList] = useState<Conversation[]>([]);

    useEffect(() => {

        // TODO: Implement API (api/conv.ts)
        const getConvos = async (): Promise<Conversation[]> => {
            return [{ oid: "kDJf018hE10idh!@fh9a911vf" }];
        }

        if (!status.loading && !status.complete && convoList.length < 1) {
            setStatus({ loading: true, complete: false });
            getConvos().then(convos => {
                setStatus({ loading: false, complete: true });
                setConvoList(convos)
            });
        }
    });

    const findContact = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log(search);
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
                {convoList.map(c => {
                    return (
                        <li className={styles.convo} onClick={() => convo_ctx.setID(c.oid)}>
                            <div className={styles.profile_pic}>
                                <img src="" alt="" />
                            </div>
                            <div className={styles.glance}>
                                <span>Steven Nguyen</span>
                                <span>last message</span>
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