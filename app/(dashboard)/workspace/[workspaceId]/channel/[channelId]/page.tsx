"use client"

import React from 'react'
import { ChannelHeader } from './_components/ChannelHeader'
import { MessageList } from './_components/MessageList'
import { MessageInputForm } from './_components/message/MessageInputForm'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc'
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs'
import { Skeleton } from '@/components/ui/skeleton'
import { ThreadSideBar } from './_components/thread/ThreadSideBar'
import { ThreadProvider, useThread } from '@/providers/ThreadProvider'
import { ChannelRealtimeProvider } from '@/providers/ChannelRealtimeProvider'

const ChannelPageMain = () => {
  const {channelId}=useParams<{channelId:string}>();
  const {isThreadOpen}=useThread();
  const {data,error, isLoading}=useQuery(
    orpc.channel.get.queryOptions({
      input:{
        channelId: channelId,
      }
  }));

  if(error){
    return <div className='p-4'>Error loading channel: {error.message}</div>
  }

  return (
    <ChannelRealtimeProvider channelId={channelId}>
      <div className='flex h-screen w-full'>
        <div className='flex-1 flex flex-col min-w-0'>

            {/* hearder */}
            {isLoading ? (
              <div className='flex items-center justify-between h-14 px-4 border-b'>
                <Skeleton className="h-8 w-40"/>
                <div className='flex items-center space-x-2'>
                  <Skeleton className="h-8 w-28"/>
                  <Skeleton className="h-8 w-20 "/>
                  <Skeleton className="h-8 w-8"/>
                </div>
              </div>
            ):(
              <ChannelHeader channelName={data?.channelName} />
            )}
            {/* message list */}
             <div className='flex-1 overflow-hidden mb-4'>
                <MessageList />
            </div>

            {/* Fixed input area */}
            <div className='border-t bg-background p-4'>
                <MessageInputForm channelId={channelId} user={data?.currentUser as KindeUser<Record<string, unknown>>} />
            </div>
        </div>
        {isThreadOpen && <ThreadSideBar user={data?.currentUser as KindeUser<Record<string, unknown>>}/>}
        
       
    </div>
    </ChannelRealtimeProvider>
  )
}


const ThisIsChannelPage= () => {
  return (
    <ThreadProvider>
      <ChannelPageMain />
    </ThreadProvider>
  );
}

export default ThisIsChannelPage;
