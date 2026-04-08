import React from "react";

type ButtonVariant = "primary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#003e93] text-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:bg-[#002d6b] active:bg-[#002460]",
  ghost:
    "bg-transparent text-[#757684] hover:text-[#454652]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-8 py-3 text-base",
  lg: "px-10 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  rightIcon,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center gap-2 justify-center rounded-lg font-normal transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
      {rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </button>
  );
}
