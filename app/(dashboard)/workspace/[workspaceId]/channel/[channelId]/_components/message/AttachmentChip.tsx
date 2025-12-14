import  Image  from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
interface AttachmentChipProps{
    url: string;
    onRemove?: ()=>void;
}
export function AttachmentChip({url, onRemove}: AttachmentChipProps){
    return (
        <div className="group relative overflow-hidden rounded-md bg-muted h-10 w-24">
            <Image src={url} alt="Attachment" fill className="object-cover"/>
            <div className="absolute inset-0 bg-black/0 bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition">
                <Button type="button" variant="destructive" size="sm" className="opacity-0 group-hover:opacity-100 transition" onClick={onRemove}>
                    <X className="size-4"/>
                </Button>
            </div>
        </div>
    )
}