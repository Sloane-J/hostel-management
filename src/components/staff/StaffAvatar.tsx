import { Navii } from "@usenavii/react";
import { useSignedPhotoUrl } from "@/hooks/useSignedPhotoUrl";

type StaffAvatarProps = {
  staffId: string;
  photoPath: string | null;
  size?: number;
};

export function StaffAvatar({ staffId, photoPath, size = 40 }: StaffAvatarProps) {
  const { url } = useSignedPhotoUrl("staff-photos", photoPath);

  if (url) {
    return (
      <img
        src={url}
        alt="Staff pic"
        style={{ width: size, height: size }}
        className="rounded-full object-cover"
      />
    );
  }

  return <Navii seed={staffId} size={size} />;
}