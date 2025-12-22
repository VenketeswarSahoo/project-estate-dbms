import { cn } from "@/lib/utils";
import * as React from "react";

export interface InputProps extends React.ComponentProps<"input"> {
  allowNumbers?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = "text", allowNumbers = false, onChange, ...props },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      switch (type) {
        case "text":
          if (allowNumbers) {
            // Letters, numbers, allowed symbols (- + * /) and spaces
            if (/^[A-Za-z0-9\-+\*\/, ]*$/.test(value)) {
              onChange?.(e);
            }
          } else {
            // Letters only (A-Z, a-z) and spaces
            if (/^[A-Za-z ]*$/.test(value)) {
              onChange?.(e);
            }
          }
          break;

        case "email":
          // Lowercase letters, numbers, and valid email symbols only
          if (/^[a-z0-9@._\-+]*$/.test(value)) {
            onChange?.(e);
          }
          break;

        case "password":
          // Password input: allow all characters
          onChange?.(e);
          break;

        case "tel":
          // Telephone input: numbers, spaces, +, -, parentheses
          if (/^[0-9+\-\s()]*$/.test(value)) {
            onChange?.(e);
          }
          break;

        case "number":
          // Only digits, max 5 digits
          if (/^\d*$/.test(value) && value.length <= 5) {
            onChange?.(e);
          }
          break;

        default:
          // Other input types handled natively
          onChange?.(e);
          break;
      }
    };

    return (
      <input
        ref={ref}
        type={type}
        onChange={handleChange}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
