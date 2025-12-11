import React from 'react'
import { WorkspaceHeader } from './_components/workspaceHeader'
import { CreateNewChannel } from './_components/createNewChannel'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronUp } from 'lucide-react'
import { ChannelList } from './_components/channelList'
import { WorkspaceMemberList } from './_components/WorkspaceMemberList'
import { getQueryClient, HydrateClient } from '@/lib/query/hydration'
import { orpc } from '@/lib/orpc'

const channelListLayout = async({children}: {children: React.ReactNode}) => {

    const queryClient=getQueryClient();
    await queryClient.prefetchQuery(orpc.channel.list.queryOptions());
  return (
    <div className='flex h-full'>
        <div className='flex flex-col h-full w-72 border-r border-border bg-secondary'>
            {/* header */}
            <div className='flex items-center justify-center px-4' style={{borderBottom:"0.1px solid #3B3C3C", height:"50px"}}>
                <HydrateClient client={queryClient}>
                    <WorkspaceHeader />
                </HydrateClient>
            </div>
            {/* create channel */}
            <div className='py-2 px-4'>
                <CreateNewChannel />
            </div>
            {/* channel list */}
            <div className='flex-1 overflow-y-auto px-4'>
                <Collapsible defaultOpen>
                    <CollapsibleTrigger 
                        className='flex w-full items-center justify-between px-2 py-1 text-sm font-medium text-muted-foreground hover:text-accent-foreground [&[data-state=open]>svg]:rotate-180'>
                    Main 
                    <ChevronUp className='size-4 transition-transform duration-200'/>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <ChannelList />
                    </CollapsibleContent>
                </Collapsible>
            </div>

            {/* Members list */}
            <div className='px-4 py-2 border-t border-border'>
                <Collapsible defaultOpen>
                    <CollapsibleTrigger 
                        className='flex w-full items-center justify-between px-2 py-1 text-sm font-medium text-muted-foreground hover:text-accent-foreground [&[data-state=open]>svg]:rotate-180'>
                    Members
                    <ChevronUp className='size-4 transition-transform duration-200'/>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <WorkspaceMemberList />
                    </CollapsibleContent>
                </Collapsible>
            </div>
           
        </div>
    </div>
  )
}

export default channelListLayout
