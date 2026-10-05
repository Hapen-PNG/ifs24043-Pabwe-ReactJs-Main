import clsx from "clsx";
import { initialsOf, resolveMediaUrl } from "../helpers/toolsHelper";

export default function Avatar({ name, photo, className }) {
  const src = resolveMediaUrl(photo);
  const base = "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full";
  return src ? (
    <img src={src} alt={`Foto ${name}`} className={clsx(base, "object-cover", className)} />
  ) : (
    <span
      aria-label={`Inisial ${name}`}
      className={clsx(base, "bg-amber-300 font-bold text-indigo-950", className)}
    >
      {initialsOf(name)}
    </span>
  );
}
