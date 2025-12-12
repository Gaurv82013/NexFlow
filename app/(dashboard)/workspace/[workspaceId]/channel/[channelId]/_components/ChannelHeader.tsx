import { ThemeToggle } from "@/components/ui/theme-toggle";

export function ChannelHeader() {
    return (
        <div className="flex w-full items-center justify-between border-b h-14 px-4">
            <h1 className="text-lg font-semibold"># Super-cool-channel</h1>
            <div className="flex items-center space-x-2">
                <ThemeToggle />
            </div>
        </div>
    )
}