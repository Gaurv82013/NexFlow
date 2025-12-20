import { Button } from "@/components/ui/button";
import { EmojiPicker, EmojiPickerContent, EmojiPickerFooter, EmojiPickerSearch } from "@/components/ui/emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SmileIcon } from "lucide-react";
import { useState } from "react";

interface EmojiReactionProps{
    // You can add props if needed
    onSelect: (emoji: string) => void;

}

export function EmojiReaction({ onSelect }: EmojiReactionProps) {
    const [open, setOpen]=useState(false);

    const handleEmojiSelect=(emoji: string)=>{
        onSelect(emoji);
        setOpen(false);

        console.log("Selected emoji:", emoji);
        // Here you would typically send the selected emoji as a reaction to the server
    };
    return(
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <SmileIcon className="size-4"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-fit p-0">
                <EmojiPicker className="h-[250px]" onEmojiSelect={(e)=>handleEmojiSelect(e.emoji)}>
                    <EmojiPickerSearch />
                    <EmojiPickerContent />
                    <EmojiPickerFooter />
                </EmojiPicker>
            </PopoverContent>
        </Popover>
    )
}