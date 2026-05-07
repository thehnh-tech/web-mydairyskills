import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2 py-[2px] text-[11.5px] font-medium leading-[1.5] border",
  {
    variants: {
      variant: {
        default: "border-border bg-background text-muted-foreground",
        solid: "border-transparent bg-secondary text-secondary-foreground",
        blue: "border-[#dbeafe] bg-[#eff6ff] text-chart-3",
        green: "border-[#dcfce7] bg-[#f0fdf4] text-[#16a34a]",
        amber: "border-[#fef3c7] bg-[#fffbeb] text-[#b45309]",
        red: "border-[#fee2e2] bg-[#fef2f2] text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
