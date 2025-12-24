import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { orpc } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { MemberItem } from "./MemberItem";
import { Skeleton } from "@/components/ui/skeleton";
import { usePresence } from "@/hooks/use-presence";
import { useParams } from "next/navigation";
import { User } from "@/app/schemas/realtime";

export function MembersOverview() {
    const params=useParams();
    const workspaceId = params.workspaceId;
    
    const [open, setOpen]=useState(false);
    const [search, setSearch]=useState("");
    const {data, isLoading, error}=useQuery(orpc.workspace.member.list.queryOptions());

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

    const {onlineUsers} = usePresence({
            room:`workspace-${workspaceId}`,
            currentUser:currentUser,
    });
    
    const members=data ?? [];
    const query =search.trim().toLowerCase();
    const filteredMembers=query ? members.filter((member)=>{
        const name= member.full_name?.toLowerCase()
        const email= member.email?.toLowerCase()
        return name?.includes(query) || email?.includes(query);
    }): members;

    const onlineUserIds = useMemo(() => new Set(onlineUsers.map((user) => user.id)), [onlineUsers]);
    
    if(error){
        return <div className="text-red-500">Failed to load members.</div>
    }
    return(
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="hover:cursor-pointer">
                    <Users />
                    <span>Members</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-70 p-3">
                <div className="space-y-4">
                    <div className="flex flex-col border-b pb-2">
                        <h3 className="text-lg font-semibold">Workspace Members</h3>
                        <p className="text-sm text-muted-foreground">Members</p>
                    </div>
                    <div className="">
                        <div className="relative">
                            <SearchIcon className="size-4 absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"/>
                            <Input type="text" placeholder="Search members..." className="h-8 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="max-h-35 overflow-y-auto">
                        {/* Members list can be added here */}
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="px-3 py-2 flex items-center gap-3">
                                    <Skeleton className="size-8 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3 rounded w-1/3" />
                                        <Skeleton className="h-3 rounded w-1/2" />
                                    </div>
                                </div>
                            ))
                        ) : filteredMembers.length === 0 ? (
                            <p className="text-sm text-muted-foreground px-3">No members found.</p>
                        ) : (
                            filteredMembers.map((member) => (
                                <MemberItem key={member.id} member={member} isOnline={member.id ? onlineUserIds.has(member.id) : false} />
                            ))
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}