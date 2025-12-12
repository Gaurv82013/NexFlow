import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Button } from "@/components/ui/button";
import { ImageIcon, Send } from "lucide-react";

interface iAppProps{
    value: string;
    onChange: (next:string)=>void;
    onSubmit:()=>void;
    isSubmitting?:boolean;
}
export function MessageComposer({value, onChange, onSubmit, isSubmitting}: iAppProps){
    return(
        <>
            <RichTextEditor field={{value, onChange}} 
            sendButton={
            <Button className="hover:cursor-pointer" type="button" size="sm" onClick={onSubmit} disabled={isSubmitting}>
                <Send className="size-4 mr-1"/>
                Send
            </Button>}

            footerLeft={
                <Button variant="outline" size="sm" type="button">
                    <ImageIcon className="size-4 ml-1"/>
                    Attach
                </Button>
            }
            />
        </>
    )
}