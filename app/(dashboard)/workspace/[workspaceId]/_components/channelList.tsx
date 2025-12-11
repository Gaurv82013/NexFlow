"use client"
import { buttonVariants } from "@/components/ui/button"
import { orpc } from "@/lib/orpc"
import { cn } from "@/lib/utils"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Hash } from "lucide-react"
import Link from "next/link"


export function ChannelList() {
    // Fetch channels using ORPC
    const {data:{channels}}=useSuspenseQuery(orpc.channel.list.queryOptions());
    return (
        <div className="space-y-0.5 py-1">
            {channels.map((channel)=>(
                <Link className={cn(buttonVariants({
                    variant:"ghost"
                }),"w-full justify-start px-2 py-2 h-10 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground")} key={channel.id} href={`#${channel.id}`}>
                    <Hash className="size-4"/>
                    <span className="truncate">{channel.name}</span>
                </Link>
            ))}
        </div>
    )
}