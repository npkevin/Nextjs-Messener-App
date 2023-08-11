import Authentication from './Authentication'
import ConversationList from './ConversationsList'
import Profile from './Profile'
import styles from '../../../styles/SideMenu.module.css'
import { useContext } from 'react'
import { AppStateCtx } from '../../../pages'

const SideMenu = (): JSX.Element => {

    const { state, setState } = useContext(AppStateCtx)

    return (
        <div className={styles.container}>
            {state.validToken ? <Profile /> : null}
            {state.validToken ? <ConversationList /> : null}
            <Authentication />
        </div>
    )
}

export default SideMenu