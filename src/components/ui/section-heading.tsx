import { cn } from "@/lib/format";
import { SprigHeart } from "./ornaments";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  id?: string;
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, align = "center", id, className }: Props) {
  const centered = align === "center";
  return (
    <div className={cn("flex flex-col gap-3", centered ? "items-center text-center" : "items-start", className)}>
      {eyebrow && (
        <p className="font-script text-2xl leading-none text-rosa-profundo sm:text-[1.7rem]">{eyebrow}</p>
      )}
      <h2 id={id} className="text-[2rem] leading-[1.1] sm:text-[2.6rem]">
        {title}
      </h2>
      {centered && <SprigHeart className="mt-1 text-dourado" />}
      {description && (
        <p className={cn("max-w-xl text-[0.98rem] leading-relaxed text-tinta-suave", centered && "mx-auto")}>
          {description}
        </p>
      )}
    </div>
  );
}
