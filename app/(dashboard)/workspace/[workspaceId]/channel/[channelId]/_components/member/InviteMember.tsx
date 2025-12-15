import { inviteMemberSchema, InviteMemberSchemaType } from "@/app/schemas/member";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { orpc } from "@/lib/orpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
export default function InviteMember() {
    const [open, setOpen] = useState(false);
    const form=useForm({
        resolver: zodResolver(inviteMemberSchema),
        defaultValues:{
            name:"",
            email:"",
        }
    });

    const inviteMutation=useMutation(
        orpc.workspace.member.invite.mutationOptions({
            onSuccess:()=>{
                toast.success("Invitation sent successfully");
                form.reset();
                setOpen(false);
            },
            onError:()=>{
                toast.error("Failed to send invitation");
            }
        })
    )

    function onSubmit(value:InviteMemberSchemaType){
        inviteMutation.mutate(value);
    }
    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="hover:cursor-pointer">
                    <UserPlus className="size-4 mr-1/2"/>
                    Invite Members
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Members</DialogTitle>
                    <DialogDescription>Send an invitation to new members to join this channel.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField 
                           control={form.control} 
                           name="name"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                                
                        />

                        <FormField 
                           control={form.control} 
                           name="email"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                                
                        />

                        <Button type="submit">Invite</Button>

                        
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}