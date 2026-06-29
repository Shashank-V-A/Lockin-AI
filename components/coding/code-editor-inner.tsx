"use client";

import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import type { ComponentProps } from "react";

loader.config({ monaco });

type EditorProps = ComponentProps<typeof Editor>;

/** Monaco editor bundled locally (no CDN — avoids CSP blocks). */
export function CodeEditorInner(props: EditorProps) {
  return <Editor {...props} />;
}
