import usePartySocket from "partysocket/react";
import { createContext, useContext, useMemo } from "react";
import { ChannelEvent, ChannelEventSchema, RealtimeMessage } from "@/app/schemas/realtime";
import { InfiniteData, useQueryClient } from '@tanstack/react-query';

type ChannelRealtimeContextValue = {
    send: (event: ChannelEvent) => void;
}
interface ChannelRealtimeProviderProps {
    children: React.ReactNode;
    channelId: string;
}

type MessageListPage={items:RealtimeMessage[]; nextCursor?:string;};
type InfiniteMessages= InfiniteData<MessageListPage>;
const ChannelRealtimeContext = createContext<ChannelRealtimeContextValue | null>(null);

export function ChannelRealtimeProvider({children, channelId}: ChannelRealtimeProviderProps){
    const queryClient = useQueryClient();
    const socket = usePartySocket({
        host:"https://nexflow-realtime.gauravkumar803109.workers.dev",
        room:`channel-${channelId}`,
        party:"chat",
        onMessage(e){
            try{
                const evt = JSON.parse(e.data);
                const result = ChannelEventSchema.safeParse(evt);

                if(!result.success){
                    console.log("Invalid channel event received");
                    return;
                }

                const event = result.data;

                if(event.type === "message:created"){
                    const raw = event.payload.message;
                    queryClient.setQueryData(["message.list", channelId], (old: InfiniteMessages | undefined) => {
                        if(!old){
                            return{
                                pageParams:[undefined],
                                pages:[{items:[raw], nextCursor:undefined}],
                            } as InfiniteMessages;
                        } 
                        const first = old.pages[0]
                        const updatedFirst:MessageListPage={
                            ...first,
                            items:[raw, ...first.items],
                        } 
                        return{
                            ...old,
                            pages:[updatedFirst, ...old.pages.slice(1)],
                        }
                    });
                    return;
                }
                if(event.type === "message:updated"){
                    const updated= event.payload.message;
                    queryClient.setQueryData<InfiniteMessages>(
                        ["message.list", channelId],
                        (old)=>{
                            if(!old) return old;
                            const updatedPages=old.pages.map((page)=>({
                                ...page,
                                items: page.items.map((msg)=> msg.id === updated.id ? {
                                    ...updated,
                                }: msg),
                            }));
                            return {
                                ...old,
                                pages: updatedPages,
                            };
                        }
                    );
                    return;
                }
                if(event.type === "reaction:updated"){
                    const {messageId, reactions} = event.payload;
                    queryClient.setQueryData<InfiniteMessages>(
                        ["message.list", channelId],
                        (old)=>{
                            if(!old) return old;
                            const updatedPages=old.pages.map((page)=>({
                                ...page,
                                items: page.items.map((msg)=> msg.id === messageId ? {
                                    ...msg,
                                    reactions: reactions,
                                }: msg),
                            }));
                            return {
                                ...old,
                                pages: updatedPages,
                            };
                        }
                    );
                    return;
                }
                if(event.type === "message:replies:increment"){
                    const {messageId, delta} = event.payload;
                    queryClient.setQueryData<InfiniteMessages>(
                        ["message.list", channelId],
                        (old)=>{
                            if(!old) return old;
                            const updatedPages=old.pages.map((page)=>({
                                ...page,
                                items: page.items.map((msg)=> msg.id === messageId ? {
                                    ...msg,
                                    repliesCount: Math.max(0, Number(msg.repliesCount ?? 0) + Number(delta)),
                                }: msg),
                            }));
                            return {
                                ...old,
                                pages: updatedPages,
                            };
                        }
                    );
                    return;
                }
            }catch{
                console.error("Failed to parse channel event message");
            }
        }
    })
    const value=useMemo<ChannelRealtimeContextValue>(()=>{
        return{
            send:(event)=>{
                socket.send(JSON.stringify(event));
            }
        }
    }, [socket])

    return(
        <ChannelRealtimeContext.Provider value={value}>
            {children}
        </ChannelRealtimeContext.Provider>
    )
}

export const useChannelRealtime = (): ChannelRealtimeContextValue => {
    const ctx = useContext(ChannelRealtimeContext);
    if (!ctx) {
        throw new Error("useChannelRealtime must be used within a ChannelRealtimeProvider");
    }
    return ctx;
}