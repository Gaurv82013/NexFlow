import arcjet, { slidingWindow } from "@/lib/arcjet"
import { base } from "../base";
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';

// Function to build a standard Arcjet instance with predefined rules
const buildStandardAj=()=>
    arcjet.withRule(
        slidingWindow({
            mode:"LIVE",
            interval:"1m",
            max:40,
        })
    )


// Middleware to apply standard security rules using Arcjet
export const writeSecurityMiddleware=base
    .$context<{
        request:Request;
        user:KindeUser<Record<string, unknown>>
    }>()
    .middleware(async({context,next, errors })=>{
        const decision =await buildStandardAj().protect(context.request, {
            userId:context.user?.id,
        });
        if(decision.isDenied()){
            if(decision.reason.isRateLimit()){
                throw errors.RATE_LIMITED({
                    message:"Access denied: Rate limit exceeded.",
                })
            }
            
            throw errors.FORBIDDEN({
                message:"Access denied.",
            })
            
        }

        return next();
    });
