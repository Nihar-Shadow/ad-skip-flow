import { Ad } from "@/lib/adFunnelConfig";
import { ExternalLink } from "lucide-react";

interface AdCardProps {
  ad: Ad;
  onAdClick: (adId: string) => void;
}

const AdCard = ({ ad, onAdClick }: AdCardProps) => {
  const handleClick = () => {
    onAdClick(ad.id);
    window.open(ad.linkURL, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-large transition-smooth cursor-pointer border border-border"
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={ad.imageURL}
          alt={ad.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-smooth"
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-smooth">
            {ad.title}
          </h3>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-smooth flex-shrink-0" />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Sponsored Advertisement
        </p>
      </div>

      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary rounded-lg transition-smooth pointer-events-none" />
    </div>
  );
};

export default AdCard;
