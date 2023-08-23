import { useState } from "react";

import { Types } from "mongoose";
import { Socket } from "socket.io-client";
import { Button } from "@/components/UI/Input";

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
        <div className="flex flex-row p-3 rounded-b bg-slate-300">
            <textarea
                className="text-sm w-full p-2 rounded drop-shadow focus:outline-none"
                onChange={(e) => setDraft(e.target.value)}
                rows={1}
                value={draft}
            />
            <Button
                className="w-1/5 ml-3 enabled:bg-green-300"
                value="Send"
                onClick={sendMessage}
                disabled={draft === ""}
            />
        </div>
    );
};

export default Messenger;
