import { useState } from "react";
import { MarketplaceCard, MarketplaceModal } from "../Common";

export default function GridMarket({
  listings,
  images,
}: {
  listings: any[];
  images: Record<string, string>;
}) {
  const [selected, setSelected] = useState<any>(null);

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <MarketplaceCard
            key={listing.tokenId.toString()}
            listing={listing}
            image={images[listing.tokenId.toString()]}
            onClick={() => setSelected(listing)}
          />
        ))}
      </div>

      {selected && (
        <MarketplaceModal
          listing={selected}
          image={images[selected.tokenId.toString()]}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
