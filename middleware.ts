import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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
    const { getClaim }=getKindeServerSession();
    const orgCode= await getClaim("org_code");

    const url=req.nextUrl;

    if(
        url.pathname.startsWith('/workspace') && !url.pathname.includes(orgCode?.value || "")){
            url.pathname=`/workspace/ ${orgCode?.value}`;
            return NextResponse.redirect(url);
        }
    
    return NextResponse.next();

}

export default createMiddleware(aj,existingMiddleware);

export const config={
    matcher:["/((?!_next/static|_next/image|favicon.ico|/rpc).*)"]
}