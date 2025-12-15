import { ThemeToggle } from "@/components/ui/theme-toggle";
import InviteMember from "./member/InviteMember";
import { MembersOverview } from "./member/MembersOverview";

interface ChannelHeaderProps {
    channelName:string | undefined;
}
export function ChannelHeader({channelName}: ChannelHeaderProps ) {
    return (
        <div className="flex w-full items-center justify-between border-b h-14 px-4">
            <h1 className="text-lg font-semibold"># {channelName}</h1>
            <div className="flex items-center space-x-3">
                <MembersOverview />
                <InviteMember />
                <ThemeToggle />
            </div>
        </div>
    )
}