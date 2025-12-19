
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query"
import { MessageItem } from "./message/MessageItem"
import { orpc } from "@/lib/orpc"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/general/EmptyState";
import { CircleArrowDown, Loader } from "lucide-react";


export function MessageList() { 
    const {channelId}=useParams<{channelId: string}>();
    const [hasInitialScrolled, setHasInitialScrolled]=useState(false);
    const scrollRef=useRef<HTMLDivElement | null>(null);
    const bottomRef=useRef<HTMLDivElement | null>(null);
    const [isAtBottom, setIsAtBottom]=useState(false);
    const lastItemIdRef=useRef<string | undefined>(undefined);
    const infiniteOptions=orpc.message.list.infiniteOptions({
        input:(pageParams:string | undefined)=>({
            channelId:channelId,
            cursor:pageParams,
            limit:10,
        }),
        queryKey:['message.list', channelId],
        initialPageParam: undefined,
        getNextPageParam:(lastPage)=> lastPage.nextCursor,
        select:(data)=>({
            pages: [...data.pages].map((p)=>({...p, items: [...p.items].reverse()})).reverse(),
            pageParams: [...data.pageParams].reverse(),
        }),

    })
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        isLoading,
        isError,
    } =useInfiniteQuery({
        ...infiniteOptions,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });

    const {data:{User}}= useSuspenseQuery(orpc.workspace.list.queryOptions())

    // Scroll to bottom when messages load initially
    useEffect(()=>{
        if(!hasInitialScrolled && data?.pages.length){
            const el=scrollRef.current;
            if(el){
                bottomRef.current?.scrollIntoView({block:"end"});
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setHasInitialScrolled(true);
                setIsAtBottom(true);
            }
        }
    }, [hasInitialScrolled, data?.pages.length]);

    //keep view pinned to bottom on late content growth (e.g., images loading)
    useEffect(()=>{
        const el=scrollRef.current;
        if(!el) return;
        const scrollToBottomIfNeeded=()=>{
            if(isAtBottom || !hasInitialScrolled){
                requestAnimationFrame(()=>{
                    bottomRef.current?.scrollIntoView({block:"end", behavior:"smooth"});
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
    },[isAtBottom, hasInitialScrolled]);

    const isNearBottom=(el: HTMLDivElement) => 
        el.scrollHeight - el.scrollTop - el.clientHeight <= 80;

    const handleScroll=()=>{
        const el=scrollRef.current;
        if(!el){
            return;
        }
        if(el.scrollTop<80 && hasNextPage && !isFetching){
            const prevScrollHeight=el.scrollHeight;
            const prevScrollTop=el.scrollTop;
            fetchNextPage().then(()=>{
                // After fetching, adjust scroll position to maintain view
                const newScrollHeight=el.scrollHeight;
                el.scrollTop=newScrollHeight - prevScrollHeight + prevScrollTop;
            });
        }
        setIsAtBottom(isNearBottom(el));
    }

    const items=useMemo(()=>{
        return data?.pages.flatMap(page=>page.items) || [];
    }, [data]);

    const isEmpty = !isLoading && items.length === 0 && !isError;

    useEffect(()=>{
        if(!items.length){
            return;
        }
        const lastId=items[items.length -1].id;
        const prevLastId=lastItemIdRef.current;
        const el=scrollRef.current;

        if( prevLastId && lastId !== prevLastId){
            if(el && isNearBottom(el)){
                requestAnimationFrame(()=>{
                    el.scrollTop=el.scrollHeight;
                });
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsAtBottom(true);
            }
             lastItemIdRef.current=lastId;
            } else if (!prevLastId) {
            lastItemIdRef.current = lastId;
        }
    }, [items]);

    const scrollToBottom=()=>{
        const el=scrollRef.current;
        if(!el) return;
        bottomRef.current?.scrollIntoView({block:"end", behavior:"smooth"});
        setIsAtBottom(true);
    }
    return(
        <div className="relative h-full">
            <div className="h-full overflow-y-auto px-4 flex flex-col space-y-1" ref={scrollRef} onScroll={handleScroll}>
                {isEmpty ? (
                    <EmptyState title="No messages" description="There are no messages in this channel." href="#" buttonText="Send a message" />
                ) : (
                    items.map((message)=>(
                    <MessageItem key={message.id} message={message} currentUserId={User.id} />
                )
                )
                )}
                <div ref={bottomRef}></div>
            </div>
            {isFetchingNextPage && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-x-2 bg-background/80 px-4 py-2 rounded-md">
                    <Loader className="size-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded-md">Loading more messages...</span>
                </div>
            )}
            {!isAtBottom && (
                <Button onClick={scrollToBottom} className="absolute bottom-4 right-5 -translate-x-1/2 bg-primary/90 hover:bg-primary/100 text-white shadow-lg hover:shadow-xl hover:cursor-pointer" type="button" size="sm">
                    <CircleArrowDown size={16} />
                </Button>
            )}

        </div>
    )
}

