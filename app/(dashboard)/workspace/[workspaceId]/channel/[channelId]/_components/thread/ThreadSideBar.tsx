import { Button } from "@/components/ui/button";
import { CircleArrowDown, MessageSquare, X } from "lucide-react";
import Image from "next/image";
import { ThreadReply } from "./ThreadReply";
import { ThreadReplyForm } from "./ThreadReplyForm";
import { useThread } from "@/providers/ThreadProvider";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { SafeContent } from "@/components/rich-text-editor/SafeContent";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { ThreadSidebarSkeleton } from "./ThreadSidebarSkeleton";
import { useEffect, useRef, useState } from "react";

interface ThreadSidebarProps{
    user:KindeUser<Record<string, unknown>>;
}
export function ThreadSideBar({user}:ThreadSidebarProps) {
    const {selectedThreadId, closeThread}=useThread();
    const scrollRef=useRef<HTMLDivElement | null>(null);
    const bottomRef=useRef<HTMLDivElement | null>(null);
    const [isAtBottom, setIsAtBottom]=useState(false);
    const lastMessageCountRef=useRef(0);
    const {data,isLoading}=useQuery(
        orpc.message.thread.list.queryOptions({
            input:{
                messageId: selectedThreadId!,
            },
            enabled: Boolean(selectedThreadId),
        })
    );

    const messsageCount=data?.messages.length ?? 0;
    const isNearBottom=(el: HTMLDivElement) => 
        el.scrollHeight - el.scrollTop - el.clientHeight <= 80;

    const handleScroll=()=>{
        const el=scrollRef.current;
        if(!el){
            return;
        }
        setIsAtBottom(isNearBottom(el));
    }

    useEffect(()=>{
        if(messsageCount === 0){
            return;
        }
        const prevMessageCount=lastMessageCountRef.current;
        const el=scrollRef.current;
        
        if(prevMessageCount>0 && messsageCount !== prevMessageCount){
            if(el && isNearBottom(el)){
                requestAnimationFrame(()=>{
                    bottomRef.current?.scrollIntoView({block:"end", behavior:"smooth"});
                });
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsAtBottom(true);
            }
        }
        lastMessageCountRef.current=messsageCount;  
    }, [messsageCount]);

    useEffect(()=>{
        const el=scrollRef.current;
        if(!el) return;
        const scrollToBottomIfNeeded=()=>{
            if(isAtBottom){
                requestAnimationFrame(()=>{
                    bottomRef.current?.scrollIntoView({block:"end"});
                })
            }
        };
        const onImageLoad=(e: Event)=>{
            if(e.target instanceof HTMLImageElement){
                scrollToBottomIfNeeded();
            }
        }

        el.addEventListener("load", onImageLoad, true);

        // ResizeObserver watches for size changes in the scroll container
        const resizeObserver=new ResizeObserver(()=>{
            scrollToBottomIfNeeded();
        });
        resizeObserver.observe(el);

        // MutationObserver watches for DOM changes in the scroll container
        const mutationObserver=new MutationObserver(()=>{
            scrollToBottomIfNeeded();
        });

        mutationObserver.observe(el, {childList:true, subtree:true, characterData:true, attributes:true});
        return ()=>{
            el.removeEventListener("load", onImageLoad, true);
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        }
    },[isAtBottom]);

    const scrollToBottom=()=>{
        const el=scrollRef.current;
        if(!el) return;
        bottomRef.current?.scrollIntoView({block:"end", behavior:"smooth"});
        setIsAtBottom(true);
    }

    if(isLoading){
        return <ThreadSidebarSkeleton />
    }
    return(
        <div className="w-[25rem] border-l h-full flex flex-col">
            {/* header */}
            <div className="px-4 border-b py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="size-4"/>
                    <span>Thread</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={closeThread}>
                        <X className="size-4" />
                    </Button>
                </div>
            </div>
            {/* body */}
            <div className="flex-1 relative overflow-y-auto">
                <div ref={scrollRef} onScroll={handleScroll} className="flex flex-col gap-2 p-2 h-full overflow-y-auto">
                    {data && (
                    <>
                    <div className="p-4 border-b bg-muted/20">
                    <div className="flex space-x-3">
                        <Image src={data.parent.authorAvatar} alt={data.parent.authorName} width={32} height={32} className="rounded-full shrink-0 size-8 "/>
                        <div className=" space-y-1 min-w-0">
                            <div>
                                <span className="font-medium ml-2 text-sm">{data.parent.authorName}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                    {new Intl.DateTimeFormat('default', {
                                        month: 'short',
                                        day: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',}
                                    ).format(data.parent.createdAt)}
                                </span>
                            </div>
                            <div className="pl-1">
                                <SafeContent content={JSON.parse(data.parent.content)} className="text-sm break-words prose dark:prose-invert max-w-none" />
                            </div>
                            

                        </div>
                        
                    </div>
                    
                </div>
                {/* Replies */}
                    <div className="p-2">
                         <p className="text-xs text-muted-foreground mb-3 px-2">
                            {data.messages.length} replies
                         </p>
                         <div className="space-y-1">
                            {data.messages.map((reply)=>(
                                <ThreadReply key={reply.id} message={reply} />
                            ))}
                         </div>
                        
                    </div>
                    <div ref={bottomRef}></div>
                    
                    </>
                )}
                </div>
                {/* scroll to bottom button - positioned outside scrolling container */}
                {!isAtBottom && (
                    <Button onClick={scrollToBottom} className="absolute bottom-4 right-5 bg-primary/90 hover:bg-primary/100 text-white shadow-lg hover:shadow-xl hover:cursor-pointer z-10" type="button" size="sm">
                        <CircleArrowDown size={16} />
                    </Button>
                )}
            </div>
            {/* Thread reply input area */}
            <div className="border-t p-4">
                <ThreadReplyForm threadId={selectedThreadId!} user={user}/>
            </div>
        </div>
    )
}