"use client"

import { useCallback, useMemo, useState } from "react";

export function useAttachmentUpload() {
    const [isOpen, setIsOpen] = useState(false);
    const [stagedUrl, setStagedUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const onUploaded=useCallback((url:string)=>{
        setStagedUrl(url);
        setIsUploading(false);
        setIsOpen(false);
    }, []);

    return useMemo(() => ({
        isOpen,
        setIsOpen,
        onUploaded,
        stagedUrl,
        isUploading,
    }), [isOpen, onUploaded, stagedUrl, isUploading]);
}

export type useAttachmentUploadType = ReturnType<typeof useAttachmentUpload>;