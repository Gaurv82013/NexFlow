"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"
import { Button } from "@/components/ui/button" 
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import  {workspaceSchema}  from "@/app/schemas/workspaceSchema"

export function CreateWorkspace() {
    const [open, setOpen] = useState(false)

    const form = useForm({
        resolver:zodResolver(workspaceSchema),
        defaultValues:{
            name:"",
        },
    });
     
    function onSubmit(){
        console.log("submitted");
    }
    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="size-12 rounded-xl text-muted-foreground border-2 border-dashed border-muted-foreground/50 hover:border-muted-foreground hover:rounded-lg hover:text-foreground transition-all duration-200">
                            <Plus className="size-5"/>
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Create Workspace</p>
                </TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Workspace</DialogTitle>
                    <DialogDescription>Create a new workspace to organize your projects and tasks.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField 
                            control={form.control}
                            name="name"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>Workspace Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="My Workspace" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                            )}/>
                        <Button type="submit">Create Workspace</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
        

    
}