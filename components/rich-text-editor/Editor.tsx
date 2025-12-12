/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { EditorContent, useEditor } from "@tiptap/react"
import { editorExtensions } from "./extensions"
import { MenuBar } from "./MenuBar"
import { ReactNode } from "react"

interface iAppProps{
    field:any,
    sendButton:ReactNode,
    footerLeft?:ReactNode,
}

export function RichTextEditor({field, sendButton, footerLeft}:iAppProps) {
    const editor = useEditor({
        extensions: editorExtensions,
        immediatelyRender: false,
        content:(()=>{
            if(!field?.value){
                return ""
            }
            try{
                return JSON.parse(field.value)
            }catch{
                return ""
            }
        })(),
        onUpdate:({editor})=>{
            if(field?.onChange){
                field.onChange(JSON.stringify(editor.getJSON()))
            }
        },
        editorProps: {
            attributes: {
                class:
                    "max-w-none min-h-[125px] p-4 focus:outline-none prose dark:prose-invert prose-sm sm:prose-base marker:text-primary",
            },
        },
    })
    return (
        <div className="relative w-full border border-input rounded-lg overflow-hidden dark:bg-input/30 flex flex-col">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="max-h-[200px] overflow-y-auto"/>
            <div className="flex items-center justify-between bg-card border-t border-input gap-2 py-2 px-3">
                <div className="flex items-center min-h-8">{footerLeft}</div>
                <div className="shink-0">{sendButton}</div>
            </div>
        </div>
    )
}