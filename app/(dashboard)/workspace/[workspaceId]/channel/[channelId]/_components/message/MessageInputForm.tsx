"use client"
import { createMessageSchema, createMessageSchemaType } from "@/app/schemas/message";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MessageComposer } from "./MessageComposer";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { orpc } from "@/lib/orpc";

interface iAppProps{
channelId:string;
}
export function MessageInputForm({channelId}:iAppProps){
    const QueryClient=useQueryClient();
    const form=useForm({
        resolver:zodResolver(createMessageSchema),
        defaultValues:{
            channelId: channelId,
            content: "",
            imageUrl: "",
        }
    })

    const createMessageMutation=useMutation(
        orpc.message.create.mutationOptions({
            onSuccess:()=>{
                return toast.success("Message sent successfully"), 
                QueryClient.invalidateQueries({
                    queryKey:orpc.message.list.key(),
                })
            },
            onError:(error)=>{
                return toast.error(`Failed to send message: ${error.message}`)
            }
        })
    )

    function onSubmit(data:createMessageSchemaType){
        createMessageMutation.mutate(data);
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
                                <MessageComposer value={field.value} onChange={field.onChange} onSubmit={()=> onSubmit(form.getValues())} isSubmitting={createMessageMutation.isPending}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
            </form>
       </Form>
    )
}