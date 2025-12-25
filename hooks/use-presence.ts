import { useState } from "react";
import usePartySocket from "partysocket/react"
import { PresenceMessageSchema, type PresenceMessage, type User } from "@/app/schemas/realtime";

interface usePresenceProps {
    room: string;
    currentUser:User | null;
}
export function usePresence({room, currentUser}: usePresenceProps) {
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

    const socket = usePartySocket({
        host:"https://nexflow-realtime.gauravkumar803109.workers.dev",
        room: room,
        party:"chat",
        onOpen(){
            console.log("Connected to presence server");

            if(currentUser){
                const message:PresenceMessage = {
                    type:"add-user",
                    payload: currentUser,
                };
                socket.send(JSON.stringify(message));
            }
        },
        onMessage(event){
            try{
                const message= JSON.parse(event.data);
                const result = PresenceMessageSchema.safeParse(message);

                if(result.success && result.data.type === "presence"){
                    setOnlineUsers(result.data.payload.users);
                }
            }catch{
                console.error("Failed to parse presence message");
            }
        },
        onClose(){
            console.log("Disconnected from presence server");
        },
        onError(){
            console.log("Presence socket error");
        }
    })

    return{
        onlineUsers,
        socket,
    }
}