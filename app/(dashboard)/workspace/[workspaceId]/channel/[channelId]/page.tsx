"use client"

import React from 'react'
import { ChannelHeader } from './_components/ChannelHeader'
import { MessageList } from './_components/MessageList'
import { MessageInputForm } from './_components/message/MessageInputForm'
import { useParams } from 'next/navigation'

const ChannelPageMain = () => {
  const {channelId}=useParams<{channelId:string}>();
  return (
    <div className='flex h-screen w-full'>
        <div className='flex-1 flex flex-col min-w-0'>

            {/* hearder */}
            <ChannelHeader />
            {/* message list */}
             <div className='flex-1 overflow-hidden mb-4'>
                <MessageList />
            </div>

            {/* Fixed input area */}
            <div className='border-t bg-background p-4'>
                <MessageInputForm channelId={channelId}/>
            </div>
        </div>
       
    </div>
  )
}

export default ChannelPageMain
