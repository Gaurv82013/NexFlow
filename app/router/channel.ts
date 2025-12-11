import {z} from "zod";
import { heavyWriteSecurityMiddleware } from "../middlewares/arcjet/heavy-writre";
import { standardSecurityMiddleware } from "../middlewares/arcjet/standard";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import { channelSchema } from "../schemas/channel";
import prisma from "@/lib/db";
import { channel } from "@/lib/generated/prisma/client";
import { init, organization_user, Organizations } from "@kinde/management-api-js";
import { KindeOrganization } from "@kinde-oss/kinde-auth-nextjs";

export const createChannel=base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .use(standardSecurityMiddleware)
    .use(heavyWriteSecurityMiddleware)
    .route({
        method:"POST",
        path:"/channels",
        summary:"Create a new channel",
        tags:["Channels"],
    })
    .input(channelSchema)
    .output(z.custom<channel>())
    .handler(async ({input, errors, context})=>{
        // Implementation for creating a channel goes here
        if (!context.workspace?.orgCode) {
            throw errors.BAD_REQUEST();
        }

        const newChannel = await prisma.channel.create({
            data:{
                name:input.name,
                workspaceId:context.workspace.orgCode,
                createdById:context.user.id ?? "",
            },
        });
        return newChannel;
    })

    export const listChannels=base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .route({
        method:"GET",
        path:"/channels",
        summary:"List all channels",
        tags:["Channels"],
    })
    .input(z.void())
    .output(z.object({
        channels:z.array(z.custom<channel>()),
        currentWorkspace:z.custom<KindeOrganization<unknown>>(),
        members:z.array(z.custom<organization_user>()),
    }))
    .handler(async({context})=>{

        const [channels, members]=await Promise.all([
            prisma.channel.findMany({
            where:{
                workspaceId:context.workspace?.orgCode,
            },
            orderBy:{
                createdAt:"desc",
            },
        }),
        (async()=>{
            init()

        const userInOrg = await Organizations.getOrganizationUsers({
            orgCode:context.workspace?.orgCode || "",
            sort:"name_asc", 
        });
        return userInOrg.organization_users;

        })(),

        ]);
    

        
        return {
            channels,
            members: members ?? [],
            currentWorkspace:context.workspace,
        }
    })