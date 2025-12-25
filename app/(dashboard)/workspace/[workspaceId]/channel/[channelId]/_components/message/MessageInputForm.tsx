"use client"
import { createMessageSchema, createMessageSchemaType } from "@/app/schemas/message";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {  useForm } from "react-hook-form";
import { MessageComposer } from "./MessageComposer";
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { orpc } from "@/lib/orpc";
import { useState } from "react";
import { useAttachmentUpload } from "@/hooks/use-attachment-upload";
import { Message } from "@/lib/generated/prisma/client";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/get-avatar";
import { useChannelRealtime } from "@/providers/ChannelRealtimeProvider";

interface iAppProps{
    channelId:string;
    user?:KindeUser<Record<string, unknown>>;
}

type MessageProps = {
    items:Message[];
    nextCursor?:string;
}
type InfiniteMessages= InfiniteData<MessageProps>;

export function MessageInputForm({channelId, user}:iAppProps){
    const [editorKey, setEditorKey]=useState(0);
    const upload=useAttachmentUpload();
    const QueryClient=useQueryClient();
    const {send}=useChannelRealtime();
    const form=useForm({
        resolver:zodResolver(createMessageSchema),
        defaultValues:{
            channelId: channelId,
            content: "",
            
        }
    })

    const createMessageMutation=useMutation(
        orpc.message.create.mutationOptions({
            onMutate:async(data)=>{
                await QueryClient.cancelQueries({
                    queryKey:["message.list", channelId],
                });
                const previousData=QueryClient.getQueryData<InfiniteMessages>(
                    ["message.list", channelId],
                );

                const tempId=`optimistic-${crypto.randomUUID()}`;
                const optimisticMessage:Message={
                    id: tempId,
                    content: data.content,
                    channelId: channelId,
                    imageUrl: data.imageUrl ?? null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    authorId: user?.id ?? "",
                    authorAvatar:getAvatar(user?.picture ?? null, user?.email ?? ""),
                    authorName:user?.given_name || "Unknown User",
                    authorEmail:user?.email ?? "",
                    threadId: data.threadId ?? null,
                };
                QueryClient.setQueryData<InfiniteMessages>(
                    ["message.list", channelId],
                    (old)=>{
                        if(!old){
                            return {
                                pages:[
                                    {
                                        items:[optimisticMessage],
                                        nextCursor:undefined,
                                    }
                                ],
                                pageParams:[undefined],
                            } satisfies InfiniteMessages;
                        }
                        
                        const firstPage=old.pages[0] ?? {
                            items:[],
                            nextCursor:undefined,
                        }
                        const updatedFirstPage={
                            ...firstPage,
                            items:[optimisticMessage, ...firstPage.items],
                        };
                        return {
                            ...old,
                            pages:[updatedFirstPage, ...old.pages.slice(1)],
                        };
                    }
                );
                return{
                    previousData,
                    tempId,
                }
            },
            onSuccess:(data, _variables, context)=>{
                QueryClient.setQueryData<InfiniteMessages>(
                    ["message.list", channelId],
                    (old)=>{
                        if(!old) return old;
                        const updatedPages=old.pages.map((page)=>({
                            ...page,
                            items: page.items.map((msg)=> msg.id === context.tempId ? {
                                ...data,
                            }: msg),
                        }));
                        return {
                            ...old,
                            pages: updatedPages,
                        };
                    }
                );
                form.reset({channelId, content:""});
                
                upload.clear();
                setEditorKey((prev)=> prev + 1);
                toast.success("Message sent successfully");
                send({
                    type:"message:created",
                    payload:{
                        message:data,
                    }
                })
            },
            onError:(_err, _variables , context)=>{
                if(context?.previousData){
                    QueryClient.setQueryData(
                        ["message.list", channelId],
                        context.previousData
                    );
                }
                toast.error(`Failed to send message ${_err instanceof Error ? _err.message : ""}`);
            }
        })
    )

    function onSubmit(data:createMessageSchemaType){
        createMessageMutation.mutate({
            ...data,
            imageUrl: upload.stagedUrl ?? undefined,
        });
    }
    return (
       <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <FormField 
                    control={form.control}
                    name="content"
                    render={({ field })=>(
                        <FormItem>
                            <FormControl>
                                <MessageComposer key={editorKey} value={field.value} onChange={field.onChange} onSubmit={()=> onSubmit(form.getValues())} isSubmitting={createMessageMutation.isLoading} upload={upload} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
            </form>
       </Form>
    )
}
