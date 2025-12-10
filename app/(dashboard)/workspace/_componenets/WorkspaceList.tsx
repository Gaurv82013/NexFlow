import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const workspaces = [
    {
        id: "1",
        name: "NexFlow",
        avatar: "N",
    },
    {
        id: "2",
        name: "OpenAI",
        avatar: "O",
    },
    {
        id: "3",
        name: "NextJS",
        avatar: "N",
    },
]

const colorCombinations = [
    "bg-blue-500 text-white hover:bg-blue-600",
    "bg-emerald-500 text-white hover:bg-emerald-600",
    "bg-purple-500 text-white hover:bg-purple-600",
    "bg-rose-500 text-white hover:bg-rose-600",
    "bg-cyan-500 text-white hover:bg-cyan-600",
    "bg-pink-500 text-white hover:bg-pink-600",
    "bg-indigo-500 text-white hover:bg-indigo-600",
]

const getWorkspaceColor=(id:string)=>{
    const charSum=id
    .split("")                                          //split the id into individual characters
    .reduce((sum, char)=>sum+char.charCodeAt(0),0);     //get the char code of each character and sum them up

    const colorIndex=charSum % colorCombinations.length;     //get the index by taking modulus with the length of color combinations

    return colorCombinations[colorIndex];
}
   

export function WorkspaceList() {
    return (
        <TooltipProvider>
            <div className="flex flex-col gap-2">
                {workspaces.map((ws)=>(
                    <Tooltip key={ws.id}>
                        <TooltipTrigger asChild>
                            <Button size="icon" className={cn("size-12", getWorkspaceColor(ws.id))}>
                                <span className="text-sm font-semibold">{ws.avatar}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>{ws.name}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    )
}
