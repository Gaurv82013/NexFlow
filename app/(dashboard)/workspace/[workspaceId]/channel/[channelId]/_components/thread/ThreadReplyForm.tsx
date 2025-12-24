import { createMessageSchema, createMessageSchemaType } from "@/app/schemas/message";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/dist/client/components/navigation";
import { useForm } from "react-hook-form"
import { MessageComposer } from "../message/MessageComposer";
import { useAttachmentUpload } from "@/hooks/use-attachment-upload";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/get-avatar";
import { MessageListItem } from "@/lib/types";
import { useChannelRealtime } from "@/providers/ChannelRealtimeProvider";

interface ThreadReplyFormProps{
    threadId:string;
    user:KindeUser<Record<string, unknown>>;
}

export function ThreadReplyForm({threadId, user}: ThreadReplyFormProps){
    const {channelId}=useParams<{channelId:string}>();
    const upload=useAttachmentUpload();
    const [editorKey, setEditorKey]=useState(0);
    const queryClient=useQueryClient();
    const {send}=useChannelRealtime();
    const form=useForm({
        defaultValues:{
            content:"",
            channelId: channelId,
            threadId: threadId,
        },
        resolver:zodResolver(createMessageSchema),
    });

    useEffect(()=>{
        form.setValue("threadId", threadId);
    },[threadId, form]);

    const createMessageMutation=useMutation(
        orpc.message.create.mutationOptions({
            onMutate:async (data)=>{
                const listOptions= orpc.message.thread.list.queryOptions({
                    input:{
                        messageId: threadId,
                    }
                });

                type MessagePage={
                    items:Array<MessageListItem>;
                    nextCursor?:string;
                }
                type InfiniteMessages=InfiniteData<MessagePage>;


                await queryClient.cancelQueries({ queryKey: listOptions.queryKey });
                const previous= queryClient.getQueryData(listOptions.queryKey);
                const optimistic: MessageListItem ={
                    id:`optimistic:${crypto.randomUUID()}`,
                    content: data.content,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    authorId: user.id,
                    authorEmail:user.email!,
                    authorName:user.given_name ?? "Unknown",
                    authorAvatar: getAvatar(user.picture ?? null, user.email!),
                    channelId: data.channelId,
                    threadId: data.threadId!,
                    imageUrl: data.imageUrl ?? null,
                    repliesCount: 0,
                    reactions: [],
                };
                queryClient.setQueryData(listOptions.queryKey, (old)=>{
                    if(!old){
                        return old;
                    }
                    return {
                        ...old,
                        messages: [...old.messages, optimistic],
                    };
                });

                // Optimistically bump replies count in parent message
                queryClient.setQueryData<InfiniteMessages>(
                    ['message.list', channelId],
                    (old)=>{
                        if(!old){
                            return old;
                        }
                        const pages= old.pages.map((page)=>({
                            ...page,
                            items: page.items.map((msg)=>
                                msg.id === threadId ? {
                                    ...msg,
                                    repliesCount: msg.repliesCount + 1,
                                } : msg
                            ),
                        }));
                        return{
                            ...old,
                            pages,
                        };
                    }
                );
                return{
                    previous,
                    listOptions,
                }
            },
            onSuccess:(_data,_vars,ctx)=>{
                queryClient.invalidateQueries({queryKey:ctx.listOptions.queryKey});
                
                form.reset({content:"", channelId, threadId});
                upload.clear();
                setEditorKey((prev)=>prev+1);
                send({
                    type: "message:replies:increment",
                    payload: {
                        messageId: threadId,
                        delta: 1,
                    },
                });
                toast.success("Reply sent successfully");
            },
            onError:(_err,_vars,ctx)=>{
                if(!ctx) return;
                const {listOptions, previous}=ctx;

                if(previous){
                    queryClient.setQueryData(listOptions.queryKey, previous);
                }
                toast.error("Failed to send reply. Please try again.");
            }
        })
    );
    function onSubmit(data:createMessageSchemaType){
        createMessageMutation.mutate({
            ...data,
            imageUrl: upload.stagedUrl ?? undefined,
        });
    }
    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <FormField name="content" control={form.control} 
                render={({field})=>(
                    <FormItem>
                        <FormControl>
                            <MessageComposer 
                                value={field.value}
                                onChange={field.onChange}
                                upload={upload}
                                key={editorKey}
                                onSubmit={()=>onSubmit(form.getValues())}
                                isSubmitting={createMessageMutation.isPending} />
                        </FormControl>
                    </FormItem>
                )} />
            </form>
        </Form>
    )
}