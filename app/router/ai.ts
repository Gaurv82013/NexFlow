import {z} from "zod";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import prisma from "@/lib/db";
import { tipTapJsonToMarkdown } from "@/lib/json-to-markdown";
import {streamText} from "ai"

import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamToEventIterator } from "@orpc/client";
import { aiSecurityMiddleware } from "../middlewares/arcjet/ai";

const openrouter = createOpenRouter({
  apiKey: process.env.LLM_KEY!,
});

const MODEL_ID="mistralai/devstral-2512:free"

const model= openrouter.chat(MODEL_ID);


export const generateThreadSummary=base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .use(aiSecurityMiddleware)
    .route({
        method:"GET",
        path:"/ai/thread/summary",
        summary:"Generate thread summary using AI",
        tags:["AI"],
    })
    .input(z.object({
        messageId:z.string(),
    }))
    .handler(async ({input,context,errors})=>{
        const baseMessage=await prisma.message.findFirst({
            where:{
                id:input.messageId,
                channel:{
                    workspaceId:context.workspace.orgCode,
                }
            },
            select:{
                id:true,
                threadId:true,
                channelId:true,

            },
        });

        if(!baseMessage){
           throw errors.NOT_FOUND({
                message:"Base message not found in the workspace",
            });
            
        }
        const parentId = baseMessage.threadId || baseMessage.id;
        const parent = await prisma.message.findFirst({
            where:{
                id:parentId,
                channel:{
                    workspaceId:context.workspace.orgCode,
                }
            },
            select:{
                id:true,
                content:true,
                createdAt:true,
                authorName:true,
                replies:{
                    orderBy:{
                        createdAt:"desc",
                    },
                    select:{
                        id:true,
                        content:true,
                        createdAt:true,
                        authorName:true,
                    },
                }
            },
        });
        if(!parent){
            throw errors.NOT_FOUND({
                message:"Parent message not found in the workspace",
            });
        }

        const replies=parent.replies.slice().reverse();

        const parentText=await tipTapJsonToMarkdown(parent.content);
        const lines=[];
        lines.push(`Thread Root - ${parent.authorName} - ${parent.createdAt.toISOString()}`);

        lines.push(parentText);

        if(replies.length>0){
            lines.push("\nReplies")
            for(const reply of replies){
                const replyText=await tipTapJsonToMarkdown(reply.content);
                lines.push(`\n---\n${reply.authorName} - ${reply.createdAt.toISOString()}\n`);
                lines.push(replyText);
            }

        }
        const compiled =lines.join("\n");

        const system=[
            "You are an expert assistant summarizing slack-like discussion threads for a product team.",
            "Use only the provided thread content; do not invent facts, names, or timelines.",
            "Output format (Markdown):",
            "-First write a single consise paragraph (2-4 statements) that capturs the thread's purpose, key decisions, context, and any blockers or next steps. No heading, no list, no intro text.",
            "-Then add a blanck line followed by exactly 2-3 bullet points (using '-' ) with the most important takeaways. Each bullet is one statement.",
            "Style: neutral, specific, and concise. preserve terminology from the thread (names, acronyms). Avoid filler or meta-commentary. Do not add a closing sentence.",
            "If the context is insufficient, return a single-sentence summary and omit the bullet list."
        ].join("\n");

        const result=streamText({
            model,
            system,
            messages:[
                {
                    role:"user",
                    content:compiled,
                }
            ],
            temperature:0.2,
        });
        return streamToEventIterator(result.toUIMessageStream());

    });


export const generateCompose = base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .use(aiSecurityMiddleware)
    .route({
        method: "POST",
        path:"/ai/compose/generate",
        summary: "Generate message compose suggestions using AI",
        tags: ["AI"],
    })
    .input(z.object({
        content: z.string(),
    }))
    .handler(async ({ input }) => {
        const markdown = await tipTapJsonToMarkdown(input.content);

       const system= `
            You are an expert rewriting assistant, not a conversational chatbot.

            Your task is to rewrite the user's input to improve clarity, structure, tone, and professionalism while preserving the original meaning, facts, intent, and terminology.

            Rules:
            - Do NOT address the user directly.
            - Do NOT ask questions or add explanations.
            - Do NOT add greetings, conclusions, or commentary.
            - Do NOT introduce new information or assumptions.
            - Remove redundancy and improve flow.
            - Maintain the original intent and context.

            Formatting:
            - Preserve existing links, mentions, emojis, and formatting.
            - Do NOT modify code blocks or inline code.
            - Output strictly in Markdown (paragraphs and optional bullet points).
            - Do NOT output HTML or images.

            Output:
            - Return ONLY the rewritten content.
            - No preamble, headings, labels, or extra text.
            `;
        const result = streamText({
            model,
            system,
            messages:[
                {
                    role:'user',
                    content:'please rewrite and improve the following content for better clarity and engagement:'

                },
                {
                    role:'user',
                    content:markdown,
                }
            ],
            temperature:0,
        })
        return streamToEventIterator(result.toUIMessageStream());
    })

