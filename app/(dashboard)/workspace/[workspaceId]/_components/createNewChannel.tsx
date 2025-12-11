"use client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { channelSchema, ChannelSchemaType, transformChannelName } from "@/app/schemas/channel";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { transform } from "zod";
import { on } from "events";
import { toast } from "sonner";
import { orpc } from "@/lib/orpc";
import { useMutation, QueryClient, useQueryClient } from '@tanstack/react-query';
import { isDefinedError } from "@orpc/client";
import { create } from "domain";

export function CreateNewChannel() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const form =useForm({
        resolver:zodResolver(channelSchema),
        defaultValues:{
            name:""
        }   
    })

    const createChannelMutation = useMutation(
        orpc.channel.create.mutationOptions({
            onSuccess:()=>{
                toast.success("Channel created successfully!");

                queryClient.invalidateQueries({
                    queryKey: orpc.channel.list.queryKey(),
                });
                form.reset();
                setOpen(false);
            },
            onError:(error)=>{
                if(isDefinedError(error)){
                    toast.error(`Failed to create channel: ${error.message}`);
                    return;
                }
                toast.error("An unexpected error occurred while creating the channel.");
            }
        })
    )

    function onSubmit(values:ChannelSchemaType){
        createChannelMutation.mutate(values);
    }

    const watchedName = form.watch("name");
    const transformedName = watchedName ? transformChannelName(watchedName) : "";
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Plus className="size-4"/>
                    Create New Channel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                    <DialogDescription>Create a new channel to get started!</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField 
                        control={form.control}
                        name="name"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>Channel Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter channel name" {...field} />
                                </FormControl>
                                
                                {/* Display the transformed channel name if it is different from the watched name */}
                                {transformedName && transformedName !== watchedName && (
                                    <p className="text-sm text-muted-foreground mt-1">Channel name will be: <code className="bg-muted px-1.5 py-0.5 rounded-xs">{transformedName}</code></p>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <Button type="submit" disabled={createChannelMutation.isPending} >
                            {createChannelMutation.isPending ? "Creating..." : "Create Channel"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}