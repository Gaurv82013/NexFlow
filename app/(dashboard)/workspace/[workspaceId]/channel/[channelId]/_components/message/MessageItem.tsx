import { SafeContent } from "@/components/rich-text-editor/SafeContent";
import { Message } from "@/lib/generated/prisma/client";
import { getAvatar } from "@/lib/get-avatar";
import Image from "next/image";
import { MessageHoverToolbar } from "../toolbar";
import { useState } from "react";
import { EditMessage } from "../toolbar/EditMessage";

interface isAppProps{
    message:Message;
    currentUserId:string;
}
export function MessageItem({message, currentUserId}: isAppProps) {
    const [isEditing, setIsEditing]=useState(false);
    return(
        <div className="flex space-x-4 relative p-2 rounded-lg group hover:bg-muted/50">
            <Image src={getAvatar(message.authorAvatar, message.authorEmail)} alt={message.authorName} width={32} height={32} className="rounded-lg size-8"/>
            <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center gap-x-2">
                    <p className="font-medium text-sm">{message.authorName}</p>
                    <span className="text-xs text-muted-foreground gap-x-1">{
                        new Intl.DateTimeFormat("en-GB",{
                            day:"numeric",
                            month:"short",
                            year:"numeric",
                        }).format(message.createdAt)} {
                        new Intl.DateTimeFormat("en-GB",{
                            hour12:false,
                            hour:"2-digit",
                            minute:"2-digit",
                        }).format(message.createdAt)}
                        
                        </span>
                </div>
                {isEditing ? (
                    <EditMessage message={message} onCancel={() => setIsEditing(false)} onSave={() => setIsEditing(false)} />
                ):(
                    <div>
                        <SafeContent className="text-sm break-words prose dark:prose-invert max-w-none mark:text-primary" content={JSON.parse(message.content)} />
                        {message.imageUrl && (
                            <div className="mt-3">
                                <Image src={message.imageUrl} alt="Message Attachment" width={512} height={384} className="rounded-md object-cover max-h-60"/>
                            </div>
                        )}
                    </div>
                )}

                    
            </div>
            <MessageHoverToolbar messageId={message.id} canEdit={message.authorId=== currentUserId} onEdit={() => setIsEditing(true)}    />
        </div>
    )
}