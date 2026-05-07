import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Trash2 } from "lucide-react";
import { collections, ObjectId } from "@/lib/mongo";
import { requireUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillEditor } from "./SkillEditor";

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await requireUser();
  const { skills } = await collections();
  let skill: any = null;
  try {
    skill = await skills.findOne({ _id: new ObjectId(id), userId });
  } catch {}
  if (!skill) notFound();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <Link href="/skills">
            <Button variant="ghost" size="icon"><ChevronLeft size={16} /></Button>
          </Link>
          <Badge variant="solid">Skill detail</Badge>
        </div>
      </header>

      <div className="scroll flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-[760px]">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-md bg-muted text-3xl">{skill.emoji}</div>
            <div className="flex-1">
              <h1 className="text-[24px] font-semibold tracking-tight">{skill.name}</h1>
              <div className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">
                <Badge variant="blue">{skill.category}</Badge>
                <Badge>Lv {skill.level}</Badge>
                <span>· {skill.entries} entries</span>
              </div>
              <div className="mt-3 progress-bar"><span style={{ width: `${Math.round(skill.progress * 100)}%` }} /></div>
              <div className="mt-1 text-[11.5px] text-muted-foreground">
                {Math.round(skill.progress * 100)}% to level {skill.level + 1}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[var(--radius)] border border-border bg-card p-5">
            <SkillEditor
              id={skill._id.toString()}
              name={skill.name}
              description={skill.description}
              emoji={skill.emoji}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
