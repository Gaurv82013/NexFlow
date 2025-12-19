import { Button } from "@/components/ui/button";
import { useThread } from "@/providers/ThreadProvider";
import { MessageSquareText, Pencil } from "lucide-react";

interface toolbarProps{
    messageId:string;
    canEdit:boolean;
    onEdit: ()=>void;
}
export function MessageHoverToolbar({messageId, canEdit, onEdit}: toolbarProps) {

    const {toggleThread}=useThread();
    return(
        <div className="absolute -right-2 -top-3 items-center p-1 rounded-md opacity-0 transition-opacity hover:opacity-100 group-hover:flex hidden bg-background/80 backdrop-blur-md border border-border group-hover:opacity-100">
            {canEdit && (
                <Button variant="ghost" size="icon" onClick={onEdit}>
                    <Pencil className="size-4" />
                </Button>
            )}
            <Button variant="ghost" size="icon" onClick={()=>toggleThread(messageId)}>
                <MessageSquareText className="size-4" />
            </Button>
        </div>
    )
}