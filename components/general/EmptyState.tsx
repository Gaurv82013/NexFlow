import { Cloud, PlusCircle } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import Link from "next/link";

interface EmptyStateProps{
    title: string;
    description: string;
    href: string;
    buttonText: string;

}
export function EmptyState({title, description, href, buttonText}:EmptyStateProps){
    return (
        <Empty className="h-48 mt-4 w-full border bg-white/50 dark:bg-gray-800/50 rounded-md">
            <EmptyHeader>
                <EmptyMedia>
                    <Cloud className="size-16 text-muted-foreground "/>
                </EmptyMedia>
                <EmptyTitle>{title}</EmptyTitle>
                <EmptyDescription>{description}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Link href={href} className="text-primary inline-flex items-center gap-x-2 bg-primary/10 px-4 py-2 rounded-md hover:bg-primary/20 transition">
                    <PlusCircle size={16} />
                    {buttonText}
                </Link>
            </EmptyContent>
        </Empty>
    )
}