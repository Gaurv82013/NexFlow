import { SafeContent } from "@/components/rich-text-editor/SafeContent";
import { Message } from "@/lib/generated/prisma/client";
import Image from "next/image";

interface ThreadReplyProps{
    message:Message;
}


export function ThreadReply({message}:ThreadReplyProps){
    return(
        <div className="flex space-x-3 p-3 hover:bg-muted/30 rounded-lg">
            <Image src={message.authorAvatar} alt={message.authorName} width={32} height={32} className="rounded-full shrink-0 size-8 "/>
            <div className=" space-y-1 min-w-0">
                            <div>
                                <span className="font-medium ml-2 text-sm">{message.authorName}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                    {new Intl.DateTimeFormat('default', {
                                        month: 'short',
                                        day: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',}
                                    ).format(message.createdAt)}
                                </span>
                            </div>
                            <div className="pl-1">
                                <SafeContent content={JSON.parse(message.content)} className="text-sm break-words prose dark:prose-invert max-w-none" />
                                {message.imageUrl && (
                                <div className="mt-2">
                                    <Image src={message.imageUrl} alt="Thread Reply Attachment" width={400} height={300} className="rounded-md object-cover max-h-48"/>

                                </div>
                                )}

                            </div>
                        </div>
        </div>
    )
}