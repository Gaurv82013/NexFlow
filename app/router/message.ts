import prisma from "@/lib/db";
import { standardSecurityMiddleware } from "../middlewares/arcjet/standard";
import { writeSecurityMiddleware } from "../middlewares/arcjet/write";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import { z } from "zod";
import { createMessageSchema, updateMessageSchema } from "../schemas/message";
import  {getAvatar}  from "@/lib/get-avatar";
import { Message }  from "@/lib/generated/prisma/client";
import { readSecurityMiddleware } from "../middlewares/arcjet/read";
import { MessageListItem } from "@/lib/types";


export const createMessage=base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .use(standardSecurityMiddleware)
    .use(writeSecurityMiddleware)
    .route({
        method: "POST",
        path: "/messages",
        summary: "Create a new message",
        tags: ["Messages"],
    })
    .input(createMessageSchema)
    .output(z.custom<Message>())
    .handler(async({input, context, errors})=>{
        // verify the channel belongs to the user's organization

        const channel= await prisma.channel.findFirst({
            where:{
                id: input.channelId,
                workspaceId: context.workspace.orgCode,
            }
        })

        if(!channel){
            throw errors.FORBIDDEN({
                message: "Channel not found in the specified workspace",
            })
        }

        // if this is a reply to a thread, verify the parent message exists in the same channel
        if(input.threadId){
            const parentMessage= await prisma.message.findFirst({
                where:{
                    id: input.threadId,
                    channel:{
                        workspaceId: context.workspace.orgCode,
                    },
                }
            })
            if(!parentMessage){
                throw errors.FORBIDDEN({
                    message: "Parent message not found in the specified channel",
                })
            }
        }
        const created= await prisma.message.create({
            data :{
                content: input.content,
                imageUrl: input.imageUrl ? input.imageUrl : undefined,
                channelId: input.channelId,
                authorId:context.user.id,
                authorEmail: context.user.email!,
                authorName:context.user.given_name ?? "Unknown",
                authorAvatar: getAvatar(context.user.picture, context.user.email!),
                threadId: input.threadId,
            }
        })
        return created

    })



export const listMessages=base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .use(standardSecurityMiddleware)
    .use(readSecurityMiddleware)
    .route({
        method: "GET",
        path: "/messages",
        summary: "List messages in a channel",
        tags: ["Messages"],
    })
    .input(z.object({
        channelId: z.string(),
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().optional(),
    }))
    .output(z.object({
        items:z.array(z.custom<MessageListItem>()),
        nextCursor: z.string().optional(),
    }))
    .handler(async({input, context, errors})=>{
        const channel= await prisma.channel.findFirst({
            where:{
                id: input.channelId,
                workspaceId: context.workspace.orgCode,
            }
        })

        if(!channel){
            throw errors.FORBIDDEN({
                message: "Channel not found in the specified workspace",
            })
        }
        const limit=input.limit ?? 30;
        const messages= await prisma.message.findMany({
            where:{
                channelId: input.channelId,
                threadId: null,
            },
            ...(input.cursor ? {
                skip:1,
                cursor:{id: input.cursor},
            }:{}),
            orderBy:[{ createdAt: "desc"},{id:"desc"}],
            take: limit,
            include:{
                _count:{
                    select:{replies: true},
                }
            },

        });
        const items:MessageListItem[]= messages.map((msg)=>({
            id: msg.id,
            content: msg.content,
            imageUrl:msg.imageUrl,
            createdAt:msg.createdAt,
            updatedAt:msg.updatedAt,
            authorAvatar:msg.authorAvatar,
            authorEmail:msg.authorEmail,
            authorId:msg.authorId,
            authorName:msg.authorName,
            channelId:msg.channelId,
            threadId:msg.threadId,
            repliesCount:msg._count.replies,
        }));
        const nextCursor= messages.length === limit ? messages[messages.length -1].id : undefined;
        return {
            items: items,
            nextCursor,
        }
    })
        
    export const updateMessage=base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .use(standardSecurityMiddleware)
    .use(writeSecurityMiddleware)
    .route({
        method: "PUT",
        path: "/messages/:messageId",
        summary: "Update a message",
        tags: ["Messages"],
    })
    .input(updateMessageSchema)
    .output(z.object({
        message: z.custom<Message>(),
        canEdit: z.boolean(),
    }))
    .handler(async({input, context, errors})=>{
        const message= await prisma.message.findFirst({
            where:{
                id: input.messageId,
                channel: {
                    workspaceId: context.workspace.orgCode,
                },
            },
            select:{
                id: true,
                authorId: true,
            }
        });
        if(!message){
            throw errors.NOT_FOUND({
                message: "Message not found in the specified workspace",
            });
        }
        if(message.authorId !== context.user.id){
            throw errors.FORBIDDEN({
                message: "You are not authorized to update this message",
            });
        }

        const updated = await prisma.message.update({
            where: { id: input.messageId },
            data: {
                content: input.content,
            },
        });
        return{
            message: updated,
            canEdit: updated.authorId === context.user.id,
        };
    })

    // List thread replies
    export const listThreadReplies=base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .use(standardSecurityMiddleware)
    .use(readSecurityMiddleware)
    .route({
        method: "GET",
        path:"/messages/:messageId/thread",
        summary: "List replies in a thread",
        tags: ["Messages"],
    })
    .input(z.object({
        messageId: z.string(),
    }))
    .output(z.object({
        parent: z.custom<Message>(),
        messages: z.array(z.custom<Message>()),
    }))
    .handler(async({input, context, errors})=>{
        // Implementation for listing thread replies goes here
        const parentRow= await prisma.message.findFirst({
            where:{
                id: input.messageId,
                channel:{
                    workspaceId: context.workspace.orgCode,
                },
            }

        });
        if(!parentRow){
            throw errors.NOT_FOUND({
                message: "Parent message not found in the specified workspace",
            });
        }

        //Fetch thread replies
        const replies= await prisma.message.findMany({
            where:{
                threadId: input.messageId,
                
            },
            orderBy:[{ createdAt: "asc"},{id:"asc"}],

        });
        const parent={
            ...parentRow,
        }
        const messages=replies.map((reply)=>({
            ...reply,
        }));
        return {
            parent,
            messages,
        };
    })