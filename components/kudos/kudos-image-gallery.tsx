import Image from "next/image";

// Horizontal row of attached photos (max 5, left-aligned) shown inside a kudos card.
export function KudosImageGallery({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {urls.slice(0, 5).map((url, i) => (
        <Image
          key={`${url}-${i}`}
          src={url}
          alt={`Ảnh đính kèm ${i + 1}`}
          width={88}
          height={88}
          className="h-[88px] w-[88px] rounded-lg object-cover"
        />
      ))}
    </div>
  );
}
