"use client";
import { useEffect, useRef, useState } from "react";
import { Markdown } from "./Markdown";

const PLACEHOLDER = "What happened today?";

export function DiaryEditor({
  value,
  onChange,
  locked,
  preview,
}: {
  value: string;
  onChange?: (v: string) => void;
  locked?: boolean;
  preview?: boolean;
}) {
  const [mode, setMode] = useState<"edit" | "preview">(locked || preview ? "preview" : "edit");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!locked && !preview && ref.current) ref.current.focus();
  }, [locked, preview]);

  if (locked || preview || mode === "preview") {
    return (
      <div className="min-h-[360px] cursor-default" onDoubleClick={() => !locked && !preview && setMode("edit")}>
        {value && value.trim().length > 0 ? (
          <Markdown source={value} />
        ) : (
          <div className="text-[15px] leading-relaxed text-muted-foreground">{PLACEHOLDER}</div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
        <span>Markdown supported · # ## - [ ]</span>
        <button
          onClick={() => setMode("preview")}
          className="rounded-md border border-border bg-background px-2 py-0.5 hover:bg-muted"
        >
          Preview
        </button>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={PLACEHOLDER}
        className="min-h-[360px] w-full resize-none border-none bg-transparent p-0 text-[15px] leading-[1.7] outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
