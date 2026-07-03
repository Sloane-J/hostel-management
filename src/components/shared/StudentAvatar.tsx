import { Navii } from "@usenavii/react";

interface StudentAvatarProps {
  studentId: string;
  photoUrl: string | null;
  name: string;
  size?: number;
}

export function StudentAvatar({ studentId, photoUrl, name, size = 64 }: StudentAvatarProps) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        className="border object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <Navii
      seed={studentId}
      size={size}
      title={name}
      styleHint="neutral"
      className="border"
    />
  );
}