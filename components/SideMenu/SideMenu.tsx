import { useContext } from 'react'
import { AppContext } from '../../pages'
import Authentication from './Authentication'
import ConversationList from './ConversationsList'
import styles from '../../styles/SideMenu.module.css'

const SideMenu = (): JSX.Element => {

    const app_ctx = useContext(AppContext)

    return (
        <div className={styles.container}>
            <ConversationList />
            <Authentication />
        </div>
    )
}

export default SideMenu