import { useState } from "react";

import { Types } from "mongoose";
import { Socket } from "socket.io-client";
import { Button } from "../UI/Input";

const Messenger = (props: {
    convo_id: Types.ObjectId;
    socket: Socket;
}): JSX.Element => {
    const [draft, setDraft] = useState("");

    const sendMessage = async () => {
        const response = await fetch(`/api/conv`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                convo_id: props.convo_id.toString(),
                content: draft,
            }),
        });
        if (response.ok) {
            props.socket.emit(
                "roomMessage",
                {
                    convo_id: props.convo_id.toString(),
                    content: JSON.stringify(await response.json()),
                },
                () => {}
            );
        }
        setDraft("");
    };

    return (
        <div className="flex flex-row p-2 bg-slate-300">
            <textarea
                className="w-full p-1 rounded"
                onChange={(e) => setDraft(e.target.value)}
                value={draft}
            />
            <Button
                className="w-28 mx-2"
                value="Send"
                onClick={sendMessage}
                disabled={draft === ""}
            />
        </div>
    );
};

export default Messenger;
