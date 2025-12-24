/* eslint-disable @typescript-eslint/no-explicit-any */
import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextMiddleware, NextRequest, NextResponse } from "next/server";

const aj=arcjet({
    key: process.env.ARCJET_API_KEY!,
    rules:[
        detectBot({
            mode:"LIVE",
            allow:[
                "CATEGORY:SEARCH_ENGINE",
                "CATEGORY:MONITOR",
                "CATEGORY:WEBHOOK",
                "CATEGORY:PREVIEW",   
            ]
        })
    ]
})



async function existingMiddleware(req:NextRequest){
    const anyReq = req as {
        nextUrl:NextRequest["nextUrl"];
        kindeAuth?:{token?:any , user?:any}

    }
    const url=req.nextUrl;
    const orgCode =anyReq.kindeAuth?.user?.org_code || anyReq.kindeAuth?.token?.org_code || anyReq.kindeAuth?.token?.claims?.org_code;

    if(url.pathname.startsWith('/workspace') && !url.pathname.includes(orgCode || "")){
        url.pathname=`/workspace/${orgCode}`;
        return NextResponse.redirect(url);
    }
    return NextResponse.next();
}


const authWrapped = withAuth(existingMiddleware,{
    publicRoutes:[
        "/",
        "/about",
        "/pricing",
        "/contact",
    ]
}) as NextMiddleware;

const combinedMiddleware: NextMiddleware = async (req, event) => {
    try{
        const p = req.nextUrl.pathname;
        // Ensure homepage is explicitly allowed as public (avoid unintended redirect)
        if (p === "/" || p === "") {
            console.log("Allowing public homepage through middleware:", p);
            return NextResponse.next();
        }
        if(p.startsWith("/api/uploadthing")){
            // Bypass auth/arcjet middleware for uploadthing API so uploads aren't blocked
            // (keep a tiny log for debugging)
            console.log("Bypassing global middleware for upload request:", p);
            return NextResponse.next();
        }
    }catch(e){
        console.warn("middleware bypass check failed", e);
        // Fail open: bypass auth if we can't determine the route
        return NextResponse.next();
    }
    return authWrapped(req, event);
};

export default createMiddleware(aj, combinedMiddleware) as NextMiddleware;


export const config={
    // Exclude Uploadthing API from middleware so upload requests are not intercepted
    // by the auth middleware and can complete properly.
    matcher:["/((?!_next/static|_next/image|favicon.ico|/rpc|/api/uploadthing).*)"]
}