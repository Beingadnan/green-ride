import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost" | "outline" | "default";
  size?: "default" | "sm" | "lg" | "xl";
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "primary", size = "default", loading, children, disabled, ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]",
        {
          "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus-visible:ring-green-500": variant === "primary" || variant === "default",
          "border border-green-600 text-green-700 hover:bg-green-50 active:bg-green-100 bg-white": variant === "secondary" || variant === "outline",
          "text-slate-700 hover:bg-slate-100 hover:text-slate-900": variant === "ghost",
          "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500": variant === "danger",
          "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-500": variant === "success",
          "h-10 px-5 py-2 text-sm": size === "default",
          "h-8 px-3 text-xs": size === "sm",
          "h-12 px-6 text-base": size === "lg",
          "h-14 px-8 text-lg": size === "xl",
        },
        (disabled || loading) ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-70 border-gray-200" : "",
        className
      )}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
});
Button.displayName = "Button";

export { Button };


