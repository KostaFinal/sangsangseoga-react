const AVATAR_COLORS = [
  "bg-rose-100/50 text-rose-700",
  "bg-sky-100/50 text-sky-700",
  "bg-amber-100/50 text-amber-700",
  "bg-emerald-100/50 text-emerald-700",
];

function hashName(name) {
  return name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

export default function AuthorAvatar({ name, src, size = 64 }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0 border border-black/5"
      />
    );
  }

  const color = AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length];
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full flex items-center justify-center shrink-0 ${color} font-serif font-bold text-2xl shadow-inner border border-white/50`}
    >
      {name.slice(0, 1)}
    </div>
  );
}
