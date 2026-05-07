"use client";
import React from "react";

// Tiny markdown subset matching the design canvas: # ## - [ ] - bold/italic/code.
export function Markdown({ source }: { source: string }) {
  const blocks = parse(source || "");
  return (
    <div className="md">
      {blocks.map((b, i) => render(b, i))}
    </div>
  );
}

type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "br" }
  | { type: "ul"; items: { check?: boolean; text: string }[] };

function parse(src: string): Block[] {
  const lines = src.split("\n");
  const out: Block[] = [];
  let listBuf: { check?: boolean; text: string }[] | null = null;
  const flush = () => {
    if (listBuf) {
      out.push({ type: "ul", items: listBuf });
      listBuf = null;
    }
  };
  for (const ln of lines) {
    if (/^#\s/.test(ln)) {
      flush();
      out.push({ type: "h1", text: ln.replace(/^#\s/, "") });
    } else if (/^##\s/.test(ln)) {
      flush();
      out.push({ type: "h2", text: ln.replace(/^##\s/, "") });
    } else if (/^- \[ \]\s/.test(ln)) {
      listBuf = listBuf || [];
      listBuf.push({ check: false, text: ln.replace(/^- \[ \]\s/, "") });
    } else if (/^- \[x\]\s/i.test(ln)) {
      listBuf = listBuf || [];
      listBuf.push({ check: true, text: ln.replace(/^- \[x\]\s/i, "") });
    } else if (/^-\s/.test(ln)) {
      listBuf = listBuf || [];
      listBuf.push({ text: ln.replace(/^-\s/, "") });
    } else if (ln.trim() === "") {
      flush();
      out.push({ type: "br" });
    } else {
      flush();
      out.push({ type: "p", text: ln });
    }
  }
  flush();
  return out;
}

function inline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/;
  let rest = text;
  let key = 0;
  while (rest.length) {
    const m = rest.match(re);
    if (!m || m.index === undefined) {
      parts.push(<span key={key++}>{rest}</span>);
      break;
    }
    if (m.index > 0) parts.push(<span key={key++}>{rest.slice(0, m.index)}</span>);
    const tok = m[0];
    if (tok.startsWith("**")) parts.push(<b key={key++}>{tok.slice(2, -2)}</b>);
    else if (tok.startsWith("*")) parts.push(<i key={key++}>{tok.slice(1, -1)}</i>);
    else parts.push(<code key={key++}>{tok.slice(1, -1)}</code>);
    rest = rest.slice(m.index + tok.length);
  }
  return parts;
}

function render(b: Block, key: number) {
  if (b.type === "h1") return <h1 key={key}>{inline(b.text)}</h1>;
  if (b.type === "h2") return <h2 key={key}>{inline(b.text)}</h2>;
  if (b.type === "br") return <div key={key} style={{ height: 6 }} />;
  if (b.type === "ul")
    return (
      <ul key={key}>
        {b.items.map((it, j) => (
          <li key={j}>
            {"check" in it ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" defaultChecked={!!it.check} readOnly />
                <span>{inline(it.text)}</span>
              </span>
            ) : (
              <span>{inline(it.text)}</span>
            )}
          </li>
        ))}
      </ul>
    );
  return <p key={key}>{inline(b.text)}</p>;
}
