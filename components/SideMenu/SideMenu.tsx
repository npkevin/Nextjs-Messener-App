import Authentication from './Authentication'
import ConversationList from './ConversationsList'
import styles from '../../styles/SideMenu.module.css'

const SideMenu = (): JSX.Element => {

    return (
        <div className={styles.container}>
            <ConversationList />
            <Authentication />
        </div>
    )
}

export default SideMenu