import { KindeOrganization, KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { z } from "zod";
import { base } from "../middlewares/base";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import { workspaceSchema } from "../schemas/workspaceSchema";
import { init, Organizations } from "@kinde/management-api-js";

export const listWorkspaces=base
    .use(requiredAuthMiddleware)  // Apply Authentication Middleware
    .use(requiredWorkspaceMiddleware) // Apply Workspace Middleware
    .route({                                // Route Definition
        method:"GET",                       // HTTP Method
        path:"/workspace",                  // Endpoint Path
        summary:"List all workspaces",      // Short Description
        tags:["Workspace"],         // Tagging for grouping in docs
    })
    .input((z.void()))             // Input Schema
    .output((z.object({
        workspaces:z.array(z.object({
            id:z.string(),
            name:z.string(),
            avatar:z.string(),
        })),
        User:z.custom<KindeUser<Record<string, unknown>>>(),        // User Info Schema
        currentWorkspace:z.custom<KindeOrganization<unknown>>(), // Current Workspace Schema
    })))        
    .handler(async({context, errors})=>{
        const {getUserOrganizations} = getKindeServerSession();  // Access Kinde Session
        const organizations=await getUserOrganizations();       // Fetch User Organizations
        if(!organizations){
            throw errors.INTERNAL_SERVER_ERROR();
        }

        return {
            workspaces:organizations?.orgs.map(org=>({             // Map to desired output format
                id:org.code,
                name:org.name ?? "My Workspace",
                avatar:org.name?.charAt(0).toUpperCase() ?? "M",
            })),
            User:context.user!,                                    // Return User Info
            currentWorkspace:context.workspace!,                   // Return Current Workspace
        };
    });


export const createWorkspace=base
    .use(requiredAuthMiddleware)  // Apply Authentication Middleware
    .use(requiredWorkspaceMiddleware) // Apply Workspace Middleware
    .route({                                // Route Definition
        method:"POST",                       // HTTP Method
        path:"/workspace",                  // Endpoint Path
        summary:"Create a new workspace",      // Short Description
        tags:["Workspace"],         // Tagging for grouping in docs
    })
    .input(workspaceSchema)             // Input Schema
    .output((z.object({
        workspaces:z.array(z.object({
           orgCode:z.string(),                          // Workspace Identifier
           workspaceName:z.string(),            // Workspace Name
        })),
        User:z.custom<KindeUser<Record<string, unknown>>>(),        // User Info Schema
        currentWorkspace:z.custom<KindeOrganization<unknown>>(), // Current Workspace Schema
    })))        
    .handler(async({context, errors, input })=>{
       init();
       let data;
       try{
        data= await Organizations.createOrganization({
            requestBody:{
                name:input.name,
            }
        });
       }catch{
        throw errors.FORBIDDEN();
       }  
       
       if(!data.organization?.code){
        throw errors.FORBIDDEN();
       }
       try{
        await Organizations.addOrganizationUsers({
            orgCode:data.organization.code,
            requestBody:{
                users:[
                    {
                        id:context.user.id,
                        roles:["admin"],
                    }
                ]
            }
        });
       }catch{
        throw errors.FORBIDDEN();
       }

       const {refreshTokens}=getKindeServerSession();
       await refreshTokens();

       return{
        workspaces:[{
            orgCode:data.organization.code,
            workspaceName:input.name,
        }],
        User:context.user!,
        currentWorkspace:context.workspace!,
       }
       
    });
