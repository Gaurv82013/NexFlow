import {baseExtensions} from "@/components/rich-text-editor/extensions"
import {renderToMarkdown} from "@tiptap/static-renderer/pm/markdown"

function normalizeWhiteSpace(markdown: string) {
    return markdown
        .replace(/\s+$/gm, ' ') // Replace trailing whitespace at the end of lines with a single space
        .replace(/ \n{3,}/g, '\n\n') // Replace spaces before 3 or more newlines with 2 newlines
        .trim(); // Trim leading and trailing whitespace
}
export async function tipTapJsonToMarkdown(json: string){
    let content;
    try{
        content=JSON.parse(json);
    }catch{
        return"";
    }
    const markdown = renderToMarkdown({
        extensions:baseExtensions,
        content:content,
    })
    
    return normalizeWhiteSpace(markdown);
}