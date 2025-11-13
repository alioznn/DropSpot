"use client";

import { ReactNode } from "react";
import cn from "classnames";

const variantStyles: Record<
  AlertVariant,
  { container: string; badge: string; text: string }
> = {
  success: {
    container:
      "border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-emerald-500/5",
    badge: "bg-emerald-500/30 text-emerald-100",
    text: "text-emerald-50",
  },
  error: {
    container:
      "border-red-500/40 bg-gradient-to-br from-red-500/15 via-red-500/10 to-red-500/5",
    badge: "bg-red-500/30 text-red-100",
    text: "text-red-50",
  },
  warning: {
    container:
      "border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-amber-500/10 to-amber-500/5",
    badge: "bg-amber-500/30 text-amber-100",
    text: "text-amber-50",
  },
  info: {
    container:
      "border-sky-500/40 bg-gradient-to-br from-sky-500/15 via-sky-500/10 to-sky-500/5",
    badge: "bg-sky-500/30 text-sky-100",
    text: "text-sky-50",
  },
};

type AlertVariant = "success" | "error" | "warning" | "info";

type AlertProps = {
  variant?: AlertVariant;
  title?: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export const Alert = ({
  variant = "info",
  title,
  description,
  icon,
  className,
}: AlertProps) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 shadow-lg shadow-black/20 backdrop-blur",
        styles.container,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
            styles.badge,
          )}
        >
          {icon ?? defaultIconForVariant(variant)}
        </span>
        <div className="space-y-1">
          {title && (
            <p className={cn("text-sm font-semibold", styles.text)}>{title}</p>
          )}
          <p className={cn("text-sm leading-relaxed", styles.text)}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

const defaultIconForVariant = (variant: AlertVariant) => {
  switch (variant) {
    case "success":
      return "✓";
    case "error":
      return "!";
    case "warning":
      return "⚠";
    case "info":
    default:
      return "ℹ";
  }
};

