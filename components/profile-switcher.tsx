import Link from "next/link";

type Props = {
  profile?: { name: string; emoji: string; color: string } | null;
};

export default function ProfileSwitcher({ profile }: Props) {
  return (
    <Link
      href="/select-profile"
      className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent"
    >
      {profile ? (
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-base"
          style={{ backgroundColor: profile.color }}
        >
          {profile.emoji}
        </span>
      ) : (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-base">
          🙂
        </span>
      )}
      <span className="max-w-[8rem] truncate">{profile?.name ?? "Switch profile"}</span>
    </Link>
  );
}
