import React from 'react'
import { WorkspaceList } from './_componenets/WorkspaceList'
import { CreateWorkspace } from './_componenets/CreateWorkspace'
import { UserNav } from './_componenets/UserNav'

const WorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex w-full h-screen'>
        <div className='h-full flex flex-col w-16 bg-secondary items-center border-r py-3 px-2'>
            <WorkspaceList />
            <div className='mt-4'>
                <CreateWorkspace />
            </div>
            <div className='mt-auto'>
              <UserNav />
            </div>
            
        </div>
        {children}
      
    </div>
  )
}

export default WorkspaceLayout
