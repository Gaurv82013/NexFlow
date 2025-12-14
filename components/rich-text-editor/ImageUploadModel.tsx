"use client"

import { useRef } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";

interface ImageUploadModelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUploaded: (url: string) => void;
}

export function ImageUploadModel({open, onOpenChange, onUploaded}: ImageUploadModelProps) {
    const toastIdRef = useRef<string | number | undefined>();

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
                            const url = res?.[0]?.url || res?.[0]?.ufsUrl;
                            if(toastIdRef.current) {
                                toast.dismiss(toastIdRef.current);
                            }
                            toast.success("Image uploaded successfully");
                            if(url) onUploaded(url);
                            onOpenChange(false);
                        }}
                        onUploadError={(error: Error)=>{
                            console.error("Upload error:", error);
                            if(toastIdRef.current) {
                                toast.dismiss(toastIdRef.current);
                            }
                            toast.error(`Upload failed: ${error?.message || "Unknown error"}`);
                        }}
                        onUploadBegin={(fileName)=>{
                            toastIdRef.current = toast.loading(`Uploading ${fileName}...`);
                        }}/>
                
            </DialogContent>
        </Dialog>
    )
}