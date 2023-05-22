import { useContext, useEffect, useState } from "react"
import { AppStateCtx } from "../../pages"

import styles from '../../styles/SideMenu.module.css'


const ConversationList = (): JSX.Element => {

    const { state, setState } = useContext(AppStateCtx)
    const [search, setSearch] = useState<string>("")

    useEffect(() => {
        let url_params = new URLSearchParams()
        // url_params.set('test', 'true')
        fetch(`http://localhost:3000/api/conv?${url_params.toString()}`)
            .then()
            .catch()
        return // () => { clean-up code } 
    }, [])

    const searchConvos = async (search_string: string) => {
    }

    const switchConvo = () => {
    }

    if (!state.validToken)
        return <></>

    return (
        <div className={styles.convo_container}>
            <input
                type="text"
                placeholder="Search by Name"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <ul className={styles.convo_list}>
            </ul>
        </div>
    )
}

export default ConversationList