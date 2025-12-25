import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sparkles } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/client";
import { client } from "@/lib/orpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import parse from "html-react-parser";

interface SummarizeThreadProps{
    messageId:string;
}
export function SummarizeThread({messageId}:SummarizeThreadProps) {
    const [open, setOpen]=useState(false);
    const {
        messages,
        status,
        error,
        sendMessage,
        setMessages,
        stop,
        clearError,
    }= useChat({
        id:`thread-summary:${messageId}`,
        transport:{
            async sendMessages(options){
                return eventIteratorToStream(
                    await client.ai.thread.summary.generate(
                        {
                            messageId:messageId,
                        },
                        {
                            signal:options.abortSignal,
                        }
                    )
                );
            },
            reconnectToStream(){
                throw new Error("Reconnecting to thread summary stream is not supported.");
            }
        }
    })

    const lastAssistent=messages.findLast((m)=>m.role==="assistant");
    const summaryText=lastAssistent?.parts.filter((part)=>part.type==="text").map((part)=>part.text).join("\n\n") ?? "";

    const md = new MarkdownIt({ html: false, linkify: true, breaks: false });
    const summaryHtml = summaryText ? md.render(summaryText) : "";
    const summarySafeHtml = summaryHtml ? DOMPurify.sanitize(summaryHtml, { USE_PROFILES: { html: true } }) : "";

    function handleOpenChanege(nextOpen:boolean){
        setOpen(nextOpen);
        if(nextOpen){
            const hasAssistantMessage=messages.some((m)=>m.role==="assistant");
            if(status !== "ready" || hasAssistantMessage){
                return;
            }
            sendMessage({text:"Summarize Thread"});
        }else{
            stop();
            clearError();
            setMessages([]);
        }
    }
    return(
        <Popover open={open} onOpenChange={handleOpenChanege}>
            <PopoverTrigger asChild>
                <Button size="sm" type="button" className="border border-blue-500 bg-black-500">
                    <span className="flex items-center gap-1.5 py-1">
                        <Sparkles className="size-4" />
                        <span className="text-xs font-medium">Summarize</span>
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[325px] p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="size-4" />
                            <span className="text-xs font-medium">
                                Ai Summary (Preview)
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
                    ):summaryText ? (
                        <div className="prose max-w-none text-sm dark:text-white light:text-black">
                            {parse(summarySafeHtml)}
                        </div>
                    ): status === "submitted" || status === "streaming" ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />

                        </div>
                    ):(
                        <div className="text-sm text-muted-foreground">
                            Click Summarize to generate
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}