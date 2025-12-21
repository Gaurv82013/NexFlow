import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { PopoverContent } from "../ui/popover";
import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/server";
import { client } from "@/lib/orpc";
import { Skeleton } from "../ui/skeleton";

interface ComposeAssistentProps{
    // You can add props if needed
    content: string;
    onAccept?: (markdown: string) => void;
}
export function ComposeAssistent({ content, onAccept }: ComposeAssistentProps){
    const [open, setOpen]=useState(false);
    const contentRef=useRef<string>(content);
    useEffect(()=>{
        contentRef.current=content;
    }, [content]);

    const {messages, status, error, stop, clearError, setMessages, sendMessage}= useChat({
        id:"compose-assistent",
        transport:{
            async sendMessages(options){
                return eventIteratorToStream(
                    await client.ai.compose.generate(
                        {
                            content: contentRef.current,
                        },
                        {
                            signal:options.abortSignal,
                        }
                    )
                )
            },
            reconnectToStream(){
                throw new Error("Reconnecting to compose stream is not supported.");
            }

            
        }
    })

    const lastAssistent=messages.findLast((m)=>m.role==="assistant");
    const composedText=lastAssistent?.parts.filter((part)=>part.type==="text").map((part)=>part.text).join("\n\n") ?? "";

    function handleOpenChanege(nextOpen:boolean){
        setOpen(nextOpen);

        if(nextOpen){
            const hasAssistantMessage=messages.some((m)=>m.role==="assistant");
            if(status !== "ready" || hasAssistantMessage){
                return;
            }
            sendMessage({text:"Rewrite this thread to be more concise and clear."} );       
        }else{
            stop();
            clearError();
            setMessages([]);
        }
    }
    return(
    
        <Popover open={open} onOpenChange={handleOpenChanege}>
            <PopoverTrigger asChild>
                <Button size="sm" type="button" variant="outline">
                    <span className="flex items-center gap-1.5 py-1">
                        <Sparkles className="size-4" />
                        <span className="text-xs font-medium">Compose</span>
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[325px] p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="size-4" />
                            <span className="text-xs font-medium">
                                Ai Compose (Preview)
                            </span>
                        </span>
                    </div>
                    {status=== "streaming" && (
                        <Button onClick={()=>{stop()}} size="sm" variant="outline">
                            Stop
                        </Button>
                    )}
                </div>
                <div className="px-4 py-3 max-h-80 overflow-y-auto">
                    {error ? (
                        <div>
                            <p className="text-sm text-red-600 mb-2">
                                {error.message}
                            </p>
                            <Button size="sm" onClick={()=>{clearError(); setMessages([]); sendMessage({text:"Summarize Thread"})}} type="button">
                                Try Again
                            </Button>
                        </div>
                    ):composedText ? (
                        <p>{composedText}</p>
                    ): status === "submitted" || status === "streaming" ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />

                        </div>
                    ):(
                        <div className="text-sm text-muted-foreground">
                            Click Compose to generate
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3 justify-end border-t px-3 py-2 bg-muted/30">
                    <Button type="submit" variant="outline" size="sm" onClick={()=>{
                        stop();
                        clearError();
                        setMessages([]);
                        setOpen(false);
                    }}>
                        Decline
                    </Button>
                    <Button type="submit" size="sm" disabled={!composedText} onClick={()=>{
                        if(!composedText) return;
                        onAccept?.(composedText);
                        stop();
                        clearError();
                        setMessages([]);
                        setOpen(false);
                    }}>
                        Accept
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}