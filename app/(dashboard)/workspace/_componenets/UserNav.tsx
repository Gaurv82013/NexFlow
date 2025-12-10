import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CreditCard, LogOut, User } from "lucide-react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import { PortalLink } from "@kinde-oss/kinde-auth-nextjs/components";

const user={
    picture:"https://static.vecteezy.com/system/resources/previews/024/183/502/original/male-avatar-portrait-of-a-young-man-with-a-beard-illustration-of-male-character-in-modern-color-style-vector.jpg",
    gaiven_name:"Gaurav",
}

export function UserNav(){
    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="size-12 rounded-xl hover:rounded-lg transition-all duration-200 bg-background border-border/50 hover:bg-accent hover:text-accent-foreground" variant="outline" size="icon">
                    <Avatar>
                        <AvatarImage src={user.picture} alt={user.gaiven_name} className="object-cover" />
                        <AvatarFallback>{user.gaiven_name.slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" sideOffset={12} className="w-56">
                <DropdownMenuLabel className="font-medium flex items-center gap-2 py-1 px-1.5 text-sm">
                     <Avatar className="size-8 rounded-lg relative ">
                        <AvatarImage src={user.picture} alt={user.gaiven_name} className="object-cover" />
                        <AvatarFallback>{user.gaiven_name.slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm ml-2 leading-tight">
                        <p className="font-medium truncate">{user.gaiven_name}</p>
                        <p className="text-sm text-muted-foreground truncate">gaurav@gmail.com</p>
                    </div>

                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <PortalLink>
                            <User /> Profile
                        </PortalLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <PortalLink>
                            <CreditCard /> Billing
                        </PortalLink>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <LogoutLink>
                        <LogOut />
                        Logout
                    </LogoutLink>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}