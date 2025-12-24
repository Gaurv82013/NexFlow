"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import Image from "next/image"
import { orpc } from "@/lib/orpc";
import { getAvatar } from "@/lib/get-avatar";
import { usePresence } from "@/hooks/use-presence";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { User } from "@/app/schemas/realtime";
import { cn } from "@/lib/utils";



export function WorkspaceMemberList() {
    const {data:{members}}=useSuspenseQuery(orpc.channel.list.queryOptions());

    const {data:workspaceData}=useQuery(orpc.workspace.list.queryOptions());

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const currentUser=useMemo(()=>{
        if(!workspaceData?.User){
            return null;
        }
        return {
            id: workspaceData.User.id,
            full_name: workspaceData.User.given_name ?? undefined,
            email: workspaceData.User.email,
            picture: workspaceData.User.picture,
        } satisfies User;

    },[workspaceData?.User]);

    const params =useParams();
    const workspaceId = params.workspaceId as string;
    const {onlineUsers} = usePresence({
        room:`workspace-${workspaceId}`,
        currentUser:currentUser,
    });

    const onlineUserIds = useMemo(() => new Set(onlineUsers.map((user) => user.id)), [onlineUsers]);



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
                         {/* online/offline indicator */}
                         <div className={cn(
                            "absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-green-500",
                            member.id && onlineUserIds.has(member.id) ? "block" : "hidden"
                         )}>

                         </div>
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