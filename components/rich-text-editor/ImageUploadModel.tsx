"use client"
import { UploadDropzone } from "@/lib/uploadthing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";

interface ImageUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUploaded: (url: string) => void;
}

export function ImageUploadModel({open, onOpenChange, onUploaded}: ImageUploadModalProps) {
    

    return(
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Image</DialogTitle>
                </DialogHeader>
                    <UploadDropzone 
                        appearance={{
                            container:"bg-card",
                            label:"text-muted-foreground",
                            allowedContent:"text-xs text-muted-foreground",
                        }}
                        endpoint={"imageUploader"}
                        onClientUploadComplete={(res)=>{
                            const url = res?.[0]?.ufsUrl;
                            if (!url) {
                                toast.error("Upload failed: No image URL returned.");
                                return;
                            }
                            toast.success("Image uploaded successfully");
                            onUploaded(url);
                        }}
                        onUploadError={(error: Error)=>{
                            toast.error(`Upload failed: ${error?.message || "Unknown error"}`);
                        }} />
                
            </DialogContent>
        </Dialog>
    )
}