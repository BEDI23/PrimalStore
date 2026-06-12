import { ButtonSpinner } from "./LoadingSpinner";

export default function LoadingButton({
  loading,
  children,
  loadingText,
  className = "btn-primary",
  type = "submit",
  disabled,
  onClick,
}: {
  loading: boolean;
  children: React.ReactNode;
  loadingText: string;
  className?: string;
  type?: "submit" | "button";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 disabled:opacity-50 ${className}`}
    >
      {loading && <ButtonSpinner />}
      {loading ? loadingText : children}
    </button>
  );
}
