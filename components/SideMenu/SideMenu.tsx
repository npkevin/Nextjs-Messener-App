import Authentication from './Authentication'
import ConversationList from './ConversationsList'
import Profile from './Profile'
import styles from '../../styles/SideMenu.module.css'

const SideMenu = (): JSX.Element => {

    return (
        <div className={styles.container}>
            <Profile />
            <ConversationList />
            <Authentication />
        </div>
    )
}

export default SideMenu