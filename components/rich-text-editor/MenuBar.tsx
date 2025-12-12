import { Editor, useEditorState } from "@tiptap/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Toggle } from "../ui/toggle";
import {Bold, Italic, Strikethrough, Code, ListIcon, ListOrdered, Undo, Redo} from "lucide-react"
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface MenuBarProps {
    editor:Editor | null;
}
export function MenuBar({editor}:MenuBarProps) {
    const editorState =useEditorState({
        editor,
        selector:({editor})=>{
            if(!editor){
                return null;
            }
            return {
                isBold: editor.isActive("bold"),
                isItalic: editor.isActive("italic"),
                isStrike: editor.isActive("strike"),
                isCodeBlock: editor.isActive("codeBlock"),
                isBulletList: editor.isActive("bulletList"),
                isOrderedList: editor.isActive("orderedList"),
                canUndo: editor.can().undo(),
                canRedo: editor.can().redo(),
            }
        }
    })
    if (!editor) {
        return null;
    }

    return(
        <div className="border border-input border-t-0 border-x-0 rounded-t-lg p-2 bg-card flex flex-wrap gap-1 items-center">
            <TooltipProvider>
                <div className="flex flex-wrap gap-1">

                    {/* for Bold */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()} 
                            className={cn(editorState?.isBold && "bg-accent" )}
                            >
                                <Bold />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Bold</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* for Italic */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle size="sm" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()} 
                            className={cn(editorState?.isItalic && "bg-accent" )}
                            >
                                <Italic />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Italic</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* for Strike */}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle size="sm" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()} 
                            className={cn(editorState?.isStrike && "bg-accent" )}
                            >
                                <Strikethrough />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Strike</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* for codeBlock */}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle size="sm" pressed={editor.isActive("codeBlock")} onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()} 
                            className={cn(editorState?.isCodeBlock && "bg-accent" )}
                            >
                                <Code />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Code Block</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* separator */}
                    <div className="w-px h-8 bg-border mx-2"></div>

                    {/* for bulletList */}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle size="sm" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} 
                            className={cn(editorState?.isBulletList && "bg-accent" )}
                            >
                                <ListIcon  />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Bullet List</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* for orderedList */}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle size="sm" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} 
                            className={cn(editorState?.isOrderedList && "bg-accent" )}
                            >
                                <ListOrdered  />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Ordered List</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* separator */}
                    <div className="w-px h-8 bg-border mx-2"></div>

                    {/* for Undo */}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="sm" onClick={() => editor.chain().focus().undo().run()} type="button" variant="ghost" disabled={!editorState?.canUndo}>
                                <Undo />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Undo</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* for Redo */}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="sm" onClick={() => editor.chain().focus().redo().run()} type="button" variant="ghost" disabled={!editorState?.canRedo}>
                                <Redo />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Redo</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>
        </div>
    )
}