"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CreditCard, LogOut, User } from "lucide-react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import { PortalLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { gatAvatar } from "@/lib/get-avatar";
import Image from "next/image";

export function UserNav(){

    const {
        data:{ User: user },
    }=useSuspenseQuery(orpc.workspace.list.queryOptions());
    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="size-12 rounded-xl hover:rounded-lg transition-all duration-200 bg-background border-border/50 hover:bg-accent hover:text-accent-foreground" variant="outline" size="icon" type="button">
                    <Avatar>
                        <AvatarImage src={gatAvatar(user.picture, user.email!)} alt={user.given_name!} className="object-cover" />
                        <AvatarFallback>{user.given_name!.slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" sideOffset={12} className="w-56">
                <DropdownMenuLabel className="font-medium flex items-center gap-2 py-1 px-1.5 text-sm">
                     <Avatar className="size-8 rounded-lg relative ">
                        <Image src={gatAvatar(user.picture, user.email!)} alt={user.given_name!} className="object-cover" fill />
                        <AvatarFallback>{user.given_name!.slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm ml-2 leading-tight">
                        <p className="text-sm font-medium truncate">{user.given_name!}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email!}</p>
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