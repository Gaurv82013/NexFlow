import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { ImageUploadModel } from "@/components/rich-text-editor/ImageUploadModel";
import { Button } from "@/components/ui/button";
import { useAttachmentUploadType } from "@/hooks/use-attachment-upload";
import { ImageIcon, Send } from "lucide-react";
import { AttachmentChip } from "./AttachmentChip";

interface iAppProps{
    value: string;
    onChange: (next:string)=>void;
    onSubmit:()=>void;
    isSubmitting?:boolean;
    upload:useAttachmentUploadType;
}
export function MessageComposer({value, onChange, onSubmit, isSubmitting, upload}: iAppProps){
    return(
        <>
            <RichTextEditor field={{value, onChange}} 
            sendButton={
            <Button className="hover:cursor-pointer" type="button" size="sm" onClick={onSubmit} disabled={isSubmitting}>
                <Send className="size-4 mr-1"/>
                Send
            </Button>}

            footerLeft={
                upload.stagedUrl ? (
                    <AttachmentChip url={upload.stagedUrl} onRemove={upload.clear} />
                ):(
                    <Button variant="outline" size="sm" type="button" onClick={()=>upload.setIsOpen(true)}>
                        <ImageIcon className="size-4 ml-1"/>
                        Attach
                    </Button>
                )
            }
            />
            <ImageUploadModel onUploaded={(url) => upload.onUploaded(url)} open={upload.isOpen} onOpenChange={upload.setIsOpen} />
        </>
    )
}