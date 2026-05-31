import Link from "next/link";
import type { MouseEventHandler } from "react";
import type { LucideIcon } from "lucide-react";

type ActionButtonProps = {
  icon: LucideIcon;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ariaLabel: string;
  title?: string;
  className?: string;
  disabled?: boolean;
};

export function ActionButton({
  icon: Icon,
  href,
  onClick,
  ariaLabel,
  title,
  className,
  disabled,
}: ActionButtonProps) {
  const classes = ["dash-action-btn", className].filter(Boolean).join(" ");
  const content = <Icon size={15} aria-hidden />;

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel} title={title}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
