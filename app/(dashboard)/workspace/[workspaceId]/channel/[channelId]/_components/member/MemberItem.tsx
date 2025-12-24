import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAvatar } from "@/lib/get-avatar";
import { cn } from "@/lib/utils";
import { organization_user } from "@kinde/management-api-js";
import Image from "next/image";

interface MemberItemProps{
    member: organization_user;
    isOnline?: boolean;
}

export function MemberItem({member, isOnline }: MemberItemProps){
    const isAdmin = member.roles?.includes("admin");
    return(
        <div className="px-3 py-2 hover:bg-accent cursor-pointer transition-colors">
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <Avatar className="size-8">
                        <Image src={getAvatar(member.picture ?? null,member.email!)} alt={member.email!} fill className="object-cover"/>
                        <AvatarFallback>
                            { (member.full_name ?? "U").charAt(0).toUpperCase() }
                        </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                        "absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-green-500",
                        isOnline ? "block" : "hidden"
                         )}>
                    
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    {isAdmin ? (
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">{member.full_name}</p>
                            <span className="inline-flex items-center rounded-md bg-blue-400/10 border border-border px-2 py-1 text-xs font-semibold text-blue-400">Admin</span>
                        </div>
                    ):(
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">{member.full_name}</p>
                            <span className="inline-flex items-center rounded-md bg-gray-400/10 border border-border px-2 py-1 text-xs font-semibold text-gray-400">User</span>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
            </div>
        </div>
    )
}