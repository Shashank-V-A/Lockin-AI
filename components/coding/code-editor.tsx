"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const CodeEditor = dynamic(
  () => import("./code-editor-inner").then((m) => m.CodeEditorInner),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full min-h-[240px] w-full rounded-lg sm:min-h-[320px]" />,
  },
);
