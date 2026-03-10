import Image from "next/image";

function getInitials(label: string) {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "SG";
}

interface DashboardAvatarProps {
  label: string;
  imageUrl: string | null | undefined;
  className: string;
  sizes: string;
  priority?: boolean;
}

export function DashboardAvatar({
  label,
  imageUrl,
  className,
  sizes,
  priority = false,
}: DashboardAvatarProps) {
  return (
    <div
      className={`brand-badge relative overflow-hidden text-sm font-semibold text-white ${className}`}
    >
      {imageUrl ? (
        <Image
          alt={label}
          src={imageUrl}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <span>{getInitials(label)}</span>
      )}
    </div>
  );
}
