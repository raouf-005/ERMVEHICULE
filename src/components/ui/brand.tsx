import { Car } from "lucide-react";

interface BrandProps {
  size?: "sm" | "md" | "lg" | "xl"; // Added xl here
  className?: string;
}

export function BrandLogo({ size = "md", className = "" }: BrandProps) {
  const sizeClasses = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-10 w-10 rounded-xl",
    lg: "h-16 w-16 rounded-2xl",
    xl: "h-20 w-20 rounded-3xl", // Added xl here
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
    xl: "h-10 w-10", // Added xl here
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Glow effect */}
      <div
        className={`absolute inset-0 bg-blue-600 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
      />

      {/* Icon Container */}
      <div
        className={`${sizeClasses[size]} relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-xl overflow-hidden`}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50" />

        {/* Active state highlight */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-500/10 to-transparent" />

        <Car
          className={`${iconSizes[size]} text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]`}
          strokeWidth={2}
        />
      </div>
    </div>
  );
}

export function BrandName({ size = "md", className = "" }: BrandProps) {
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-4xl", // Added xl here
  };

  return (
    <span
      className={`${textSizes[size]} font-bold tracking-tight text-slate-900 dark:text-white ${className}`}
    >
      Garage<span className="text-blue-600 dark:text-blue-500">ERP</span>
    </span>
  );
}
