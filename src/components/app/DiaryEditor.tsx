"use client";
import { useEffect, useRef } from "react";

const PLACEHOLDER = "What happened today?";

export function DiaryEditor({
  value,
  onChange,
  locked,
}: {
  value: string;
  onChange?: (v: string) => void;
  locked?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!locked && ref.current) ref.current.focus();
  }, [locked]);

  if (locked) {
    return (
      <div className="min-h-[360px] whitespace-pre-wrap text-[15px] leading-[1.7] text-foreground">
        {value && value.trim().length > 0 ? (
          value
        ) : (
          <div className="text-[15px] leading-relaxed text-muted-foreground">{PLACEHOLDER}</div>
        )}
      </div>
    );
  }

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={PLACEHOLDER}
      className="min-h-[360px] w-full resize-none border-none bg-transparent p-0 text-[15px] leading-[1.7] outline-none placeholder:text-muted-foreground"
    />
  );
}
