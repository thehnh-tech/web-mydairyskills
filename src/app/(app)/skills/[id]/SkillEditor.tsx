"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function SkillEditor({
  id, name: initName, description: initDesc, emoji: initEmoji,
}: { id: string; name: string; description: string; emoji: string }) {
  const router = useRouter();
  const [name, setName] = useState(initName);
  const [description, setDescription] = useState(initDesc);
  const [emoji, setEmoji] = useState(initEmoji);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/skills/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, emoji }),
    });
    setSaving(false);
    router.refresh();
  }

  async function remove() {
    await fetch(`/api/skills/${id}`, { method: "DELETE" });
    router.push("/skills");
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-[12px] font-medium text-muted-foreground">Emoji</label>
        <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} className="w-24" />
      </div>
      <div>
        <label className="mb-1 block text-[12px] font-medium text-muted-foreground">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-[12px] font-medium text-muted-foreground">Description</label>
        <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex items-center justify-between">
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        {!confirming ? (
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
            <Trash2 size={14} /> Delete skill
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-muted-foreground">Sure?</span>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
            <Button size="sm" variant="destructive" onClick={remove}>Delete</Button>
          </div>
        )}
      </div>
    </div>
  );
}
