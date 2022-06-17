import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../pages'
import Authentication from './Authentication'
import ConversationList from './ConversationsList'
import styles from '../../styles/SideMenu.module.css'

const SideMenu = (): JSX.Element => {

    const app_ctx = useContext(AppContext)
    const [hasJwt, setHasJwt] = useState<boolean>(false)

    useEffect(() => {
        setHasJwt(!!app_ctx.state.jwt)
        // Cleanup
        return () => {
            setHasJwt(false)
        }
    }, [app_ctx.state.jwt])

    return (
        <div className={styles.container}>
            {hasJwt ?
                <ConversationList />
                :
                <></>
            }
            <Authentication />
        </div>
    )
}

export default SideMenu