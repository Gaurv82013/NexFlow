"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSuspenseQuery } from "@tanstack/react-query"
import Image from "next/image"
import { orpc } from "@/lib/orpc";
import { getAvatar } from "@/lib/get-avatar";



export function WorkspaceMemberList() {
    const {data:{members}}=useSuspenseQuery(orpc.channel.list.queryOptions());
    return(
        <div className="space-y-0.5 py-1">
            {members.map((member)=>(
                <div key={member.id} className="px-3 flex items-center gap-4 hover:bg-accent cursor-pointer transition-colors duration-200 py-2">
                    <div className="relative">
                        <Avatar className="size-8 relative">
                            <Image src={getAvatar(member.picture ?? null, member.email!)} alt={member.full_name ?? ""} className="object-cover" fill/>
                            <AvatarFallback>
                                {member.full_name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                   
                    <div>
                        <p className="text-sm font-medium text-foreground truncate">{member.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                </div>
               
            ))}
                
        </div>
    )
}