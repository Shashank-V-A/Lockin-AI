"use client";

import { UploadDropzone } from "@/lib/uploadthing-client";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

interface ResumeUploadDropzoneProps {
  onClientUploadComplete: (files: { url?: string; ufsUrl?: string; key: string; name: string }[]) => void;
  onUploadError: (error: Error) => void;
}

/** Styled resume upload dropzone with constrained icon sizing. */
export function ResumeUploadDropzone({
  onClientUploadComplete,
  onUploadError,
}: ResumeUploadDropzoneProps) {
  return (
    <UploadDropzone
      endpoint="resumeUploader"
      config={{ cn }}
      className={cn(
        "upload-dropzone mt-0 border-none bg-transparent p-0",
        "[&_[data-ut-element=label]]:mt-4 [&_[data-ut-element=label]]:text-sm [&_[data-ut-element=label]]:font-medium [&_[data-ut-element=label]]:text-foreground",
        "[&_[data-ut-element=allowed-content]]:mt-1 [&_[data-ut-element=allowed-content]]:text-xs [&_[data-ut-element=allowed-content]]:text-muted-foreground",
        "[&_[data-ut-element=button]]:mt-4 [&_[data-ut-element=button]]:h-9 [&_[data-ut-element=button]]:w-auto [&_[data-ut-element=button]]:min-w-[8rem] [&_[data-ut-element=button]]:rounded-lg [&_[data-ut-element=button]]:border-none [&_[data-ut-element=button]]:bg-accent [&_[data-ut-element=button]]:px-4 [&_[data-ut-element=button]]:text-sm [&_[data-ut-element=button]]:font-medium [&_[data-ut-element=button]]:text-accent-foreground",
      )}
      content={{
        uploadIcon: () => (
          <Upload className="mx-auto h-10 w-10 stroke-[1.5] text-muted-foreground" aria-hidden />
        ),
      }}
      onClientUploadComplete={onClientUploadComplete}
      onUploadError={onUploadError}
    />
  );
}
