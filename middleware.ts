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


export default createMiddleware(aj,withAuth(existingMiddleware,{
    publicRoutes:[
        "/",
        "/about",
        "/pricing",
        "/contact",
        "/api/uploadthing",
        "/api/uploadthing/:path*"
    ]
}) as NextMiddleware
);


export const config={
    matcher:["/((?!_next/static|_next/image|favicon.ico|/rpc).*)"]
}