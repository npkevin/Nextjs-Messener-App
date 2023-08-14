import { useContext, useEffect, useState } from "react";
import { AppStateCtx } from "../../../pages";
import { Types } from "mongoose";

import Image from "next/image";
import { CreateUserInput } from "../../schema/user.schema";
import { ConvoDocument } from "../../models/convo.model";
import { MessageDocument } from "../../models/message.model";

type User = Omit<CreateUserInput, "password"> & { _id: Types.ObjectId };
type Convo = { id: Types.ObjectId };

const ConversationList = (): JSX.Element => {
    const { state, setState } = useContext(AppStateCtx);
    const [search, setSearch] = useState<string>("");
    const [users, setUsers] = useState<User[]>([]);
    const [convos, setConvos] = useState<Convo[]>([]);

    useEffect(() => {
        // TODO: remove this, only for dev
        let url_params = new URLSearchParams();
        url_params.set("search_all", "true");
        fetch(`/api/search?${url_params}`)
            .then(async (response) => {
                if (response.ok) {
                    const users_trimmed = (await response.json()) as User[];
                    setUsers(users_trimmed);
                }
            })
            .catch();
        return; // () => { clean-up code }
    }, []);

    const searchConvos = async (search_string: string) => {};

    const selectUserHandler = async (user: User) => {
        if (!state.convo || state.convo.user.id !== user._id) {
            let url_params = new URLSearchParams();
            url_params.set("user_id", user._id.toString());
            const response = await fetch(`/api/conv?${url_params}`);

            if (response.ok) {
                const convo_doc = (await response.json()) as ConvoDocument;
                const messages_history =
                    convo_doc.messages as MessageDocument[];
                const messages_history_casted = messages_history.map(
                    (message) => {
                        message.sender_id = new Types.ObjectId(
                            message.sender_id
                        );
                        message.convo_id = new Types.ObjectId(message.convo_id);
                        message.createdAt = new Date(message.createdAt);
                        message.updatedAt = new Date(message.updatedAt);
                        return message;
                    }
                );
                // console.log(convo_doc)
                setState({
                    convo: {
                        id: new Types.ObjectId(convo_doc._id),
                        user: {
                            id: new Types.ObjectId(user._id),
                            name: user.name,
                        },
                        messages_history: messages_history_casted,
                    },
                });
            }
        }
    };

    return (
        <div className={/* styles.convo_container */ ""}>
            <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={true}
            />
            <span style={{ color: "white", fontSize: "0.8em" }}>
                Recent/New Users
            </span>
            <ul className={/* styles.convo_list */ ""}>
                {users.map((user) => (
                    <li
                        className={/* styles.convo */ ""}
                        key={user._id.toString()}
                        onClick={() => selectUserHandler(user)}
                    >
                        <div className={/* styles.profile_pic */ ""}>
                            <Image
                                src="/profile.png"
                                alt=""
                                width="100"
                                height="100"
                            />
                        </div>
                        <div className={/* styles.glance */ ""}>
                            <span>
                                {`${user.name.first} ${user.name.last}`.toUpperCase()}
                            </span>
                            {/* <span>Offline</span> */}
                        </div>
                    </li>
                ))}
                {convos.map((convo) => (
                    <li
                        className={/* styles.convo */ ""}
                        key={convo.id.toString()}
                    >
                        <div className={/* styles.profile_pic */ ""}>
                            <Image
                                src="/profile.png"
                                alt=""
                                width="100"
                                height="100"
                            />
                        </div>
                        <div className={/* styles.glance */ ""}>
                            <span>convo name</span>
                            <span>last message</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConversationList;
