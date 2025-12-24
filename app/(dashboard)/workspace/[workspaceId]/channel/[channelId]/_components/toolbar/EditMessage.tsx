import { updateMessageSchema, updateMessageSchemaType } from "@/app/schemas/message"
import { RichTextEditor } from "@/components/rich-text-editor/Editor"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Message } from "@/lib/generated/prisma/client"
import { orpc } from "@/lib/orpc"
import { useChannelRealtime } from "@/providers/ChannelRealtimeProvider"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useForm } from "react-hook-form"
import { toast } from "sonner"

interface EditMessageProps{
    message:Message;
    onCancel: ()=>void;
    onSave: ()=>void;
}
export function EditMessage({message, onCancel, onSave}: EditMessageProps){
    const QueryClient=useQueryClient();
    const {send}=useChannelRealtime();
    const form=useForm({
        defaultValues:{
            content: message.content,
            messageId: message.id,
        },
        resolver:zodResolver(updateMessageSchema)
    })

    const updateMutation=useMutation(orpc.message.update.mutationOptions({
        onSuccess:(updated)=>{
            type MessagePage={items: Message[]; nextCursor: string | null}
            type InfiniteMessages=InfiniteData<MessagePage>
            QueryClient.setQueryData<InfiniteMessages>(
                ['message.list',message.channelId],
                (old)=>{
                    if(!old){
                        return old;
                    }
                    const updatedMessage= updated.message;  
                    const pages=old.pages.map((page)=>({
                        ...page,
                        items: page.items.map((msg)=> msg.id === updatedMessage.id ? {...msg, ...updatedMessage} : msg),
                    }));
                    return {...old, pages }

                }
            )
            toast.success("Message updated successfully");
            send({
                type:"message:updated",
                payload:{
                    message:updated.message,
                }
            });
            onSave();
            
        },
        onError:(error)=>{
            console.error("Failed to update message:", error);
        }
    }))

    function onSubmit(data: updateMessageSchemaType){
        updateMutation.mutate(data);
    }
    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField 
                control={form.control}
                name="content"
                render={({field})=>(
                    <FormItem>
                        <FormControl>
                            <RichTextEditor field={field}
                             sendButton={
                                <div className="flex gap-3 items-center">
                                    <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={updateMutation.isPending}>Cancel</Button>
                                    <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                                        {updateMutation.isPending ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                             } />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            </form>
        </Form>
    )
}