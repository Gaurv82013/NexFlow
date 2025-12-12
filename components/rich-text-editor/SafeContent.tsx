import { convertJsonToHtml } from "@/lib/json-to-html";
import { JSONContent } from "@tiptap/react";
import DOMpurify from "dompurify";
import parse from "html-react-parser";

interface iAppProps{
    content:JSONContent;
    className?:string;
}

export function SafeContent({content, className}:iAppProps){
    const html=convertJsonToHtml(content);
    const clean=DOMpurify.sanitize(html);
    return <div className={className}>{parse(clean)}</div>
}