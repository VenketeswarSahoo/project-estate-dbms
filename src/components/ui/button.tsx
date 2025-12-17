import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors " +
    "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 outline-none " +
    "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "relative overflow-hidden cursor-pointer " +
          "bg-gradient-to-t from-muted/70 to-muted/50 text-foreground border border-border/60 " +
          "before:absolute before:inset-0 before:border-t-[3px] before:border-white before:rounded-lg before:scale-[0.98] before:opacity-75 " +
          "dark:bg-gradient-to-t dark:from-muted/40 dark:to-muted/20 " +
          "dark:border-border/40 " +
          "dark:before:border-white/40",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",

        default:
          "relative bg-gradient-to-b from-primary via-primary/90 to-[#B8860B] text-primary-foreground overflow-hidden " +
          "shadow-lg shadow-primary/20 " +
          "before:absolute before:inset-0 before:border-t-[3px] before:border-white/50 before:rounded-lg before:scale-[0.98] " +
          "hover:bg-gradient-to-b hover:from-primary/90 hover:via-primary/80 hover:to-[#B8860B]/90",
      },
      size: {
        default: "h-9 px-5 w-[158px] text-sm",
        sm: "h-7 px-4 text-xs w-[128px] text-sm",
        lg: "h-11 px-6 w-[158px]",
        icon: "h-9 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  disabled,
  children,
  loading = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader className="animate-spin size-4" /> : children}
    </Comp>
  );
}

export { Button, buttonVariants };
