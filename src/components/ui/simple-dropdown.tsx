"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";

interface SimpleDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
}

function SimpleDropdown({
  trigger,
  children,
  align = "end",
}: SimpleDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md animate-in fade-in-0 zoom-in-95",
            align === "end" ? "right-0" : "left-0"
          )}
        >
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(
                  child as React.ReactElement<{ onClick?: () => void }>,
                  {
                    onClick: () => {
                      (child.props as { onClick?: () => void }).onClick?.();
                      setOpen(false);
                    },
                  }
                )
              : child
          )}
        </div>
      )}
    </div>
  );
}

interface SimpleDropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  destructive?: boolean;
}

function SimpleDropdownItem({
  className,
  destructive,
  ...props
}: SimpleDropdownItemProps) {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100",
        destructive && "text-red-600 hover:bg-red-50 focus:bg-red-50",
        className
      )}
      {...props}
    />
  );
}

function SimpleDropdownSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-zinc-200", className)} />;
}

export { SimpleDropdown, SimpleDropdownItem, SimpleDropdownSeparator };
