import { Leaf } from "lucide-react";
import { BOUTIQUE_NOM } from "@/lib/constants";

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

export function LoadingSpinner({
  size = "md",
  className = "",
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <div
      className={`animate-spin rounded-full border-primary border-t-transparent ${sizes[size]} ${className}`}
      role="status"
      aria-label="Chargement"
    />
  );
}

export function PageLoader({
  message = "Chargement...",
  variant = "client",
}: {
  message?: string;
  variant?: "client" | "admin";
}) {
  if (variant === "admin") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
            <Leaf className="h-8 w-8 animate-pulse text-primary" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{BOUTIQUE_NOM}</p>
          <p className="mt-2 text-sm text-gray-500">{message}</p>
        </div>
        <LoadingSpinner size="md" />
      </div>
    </div>
  );
}

export function ButtonSpinner() {
  return (
    <LoadingSpinner
      size="sm"
      className="border-white border-t-transparent"
    />
  );
}
