import { Skeleton } from "@/components/ui/skeleton";

export function ThreadSidebarSkeleton() {
    return(
        <div className="w-[25rem] border-l h-full flex flex-col">
            <div className="flex w-full items-center justify-between border-b border-border h-14 px-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="size-8"/>
                    <Skeleton className="h-8 w-20"/>    
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-25"/>
                    <Skeleton className="size-8"/>
                </div>
            </div>
            {/* body skeleton */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                <div className="space-y-2">
                    {Array.from({length:4}).map((_, index) => (
                        <div key={index} className="flex space-x-3">
                            <Skeleton className="rounded-full size-8 shrink-0"/>
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-32"/>
                                <Skeleton className="h-4 w-full"/>
                                <Skeleton className="h-4 w-3/4"/>
                            </div>
                        </div>
                    ))} 
                </div>
                {/* replies skeleton */}
                <div className="border-t pt-4">
                    <Skeleton className="h-48 w-full rounded-lg"/>
                </div>


            </div>
        </div>
    )
}