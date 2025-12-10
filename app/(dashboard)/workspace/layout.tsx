import React from 'react'
import { WorkspaceList } from './_componenets/WorkspaceList'
import { CreateWorkspace } from './_componenets/CreateWorkspace'
import { UserNav } from './_componenets/UserNav'
import { getQueryClient, HydrateClient } from '@/lib/query/hydration';
import { orpc } from '@/lib/orpc';  

const WorkspaceLayout = async({ children }: { children: React.ReactNode }) => {
  const QueryClient = getQueryClient();           // Pre-fetch any necessary data here if needed

  await QueryClient.prefetchQuery(orpc.workspace.list.queryOptions());    // Example prefetching
  return (
    <div className='flex w-full h-screen'>
        <div className='h-full flex flex-col w-16 bg-secondary items-center border-r py-3 px-2'>

          {/* Hydrate the client with the pre-fetched data */}
          <HydrateClient client={QueryClient}>
            <WorkspaceList />
          </HydrateClient>
            
            <div className='mt-4'>
                <CreateWorkspace />
            </div>
            <div className='mt-auto'>
              <HydrateClient client={QueryClient}>
                <UserNav />
              </HydrateClient>
              
            </div>
            
        </div>
        {children}
      
    </div>
  )
}

export default WorkspaceLayout
