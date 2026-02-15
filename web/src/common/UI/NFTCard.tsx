import { useMemo, useState } from "react";

export type NFT = {
  active: boolean;
  listingId: bigint;
  nftContract: string;
  price: string;
  seller: string;
  tokenId: string;
  tokenURI: string;
};

export type SortKey = "price-asc" | "price-desc" | "tokenId-asc" | "tokenId-desc";

export type NFTGridProps = {
  items: NFT[];
  showOnlyListed?: boolean;
  title?: string;
  emptyText?: string;
  onSelect?: (nft: NFT) => void;
  loading?: boolean;
  loadingCount?: number;
};

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function formatEth(weiString: string) {
  try {
    const eth = Number(weiString) / 1e18;
    return `${eth.toFixed(4)} ETH`;
  } catch {
    return "— ETH";
  }
}

function ListedPill({ listed }: { listed: boolean }) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        listed
          ? "bg-emerald-600/10 text-emerald-700"
          : "bg-slate-500/10 text-slate-700"
      )}
    >
      <span
        className={classNames(
          "h-1.5 w-1.5 rounded-full",
          listed ? "bg-emerald-600" : "bg-slate-500"
        )}
      />
      {listed ? "Listed" : "Unlisted"}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-square w-full animate-pulse rounded-2xl bg-slate-200/70" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200/70" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200/70" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="h-7 animate-pulse rounded-lg bg-slate-200/70" />
          <div className="h-7 animate-pulse rounded-lg bg-slate-200/70" />
        </div>
      </div>
    </div>
  );
}

export default function NFTGrid({
  items,
  showOnlyListed = false,
  title = "NFTs",
  emptyText,
  onSelect,
  loading = false,
  loadingCount = 12,
}: NFTGridProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("tokenId-asc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let base = items;

    if (showOnlyListed) {
      base = base.filter((x) => x.active);
    }

    if (q) {
      base = base.filter((x) => {
        const hay = `${x.tokenId} ${x.nftContract}`.toLowerCase();
        return hay.includes(q);
      });
    }

    const cmp = (a: NFT, b: NFT) => {
      switch (sort) {
        case "price-asc":
          return Number(a.price) - Number(b.price);
        case "price-desc":
          return Number(b.price) - Number(a.price);
        case "tokenId-asc":
          return Number(a.tokenId) - Number(b.tokenId);
        case "tokenId-desc":
          return Number(b.tokenId) - Number(a.tokenId);
        default:
          return 0;
      }
    };

    return [...base].sort(cmp);
  }, [items, showOnlyListed, query, sort]);

  const empty =
    emptyText ?? (showOnlyListed ? "No listed NFTs found." : "No NFTs found.");

  return (
    <section className="w-full">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {loading
              ? "Loading…"
              : `${filtered.length} item${filtered.length === 1 ? "" : "s"}`}
            {showOnlyListed ? " • listed only" : ""}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by token ID or contract..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:shadow-md"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                aria-label="Clear search"
              >
                ✕
              </button>
            ) : null}
          </div>

          {/* Sort */}
          <div className="w-full md:w-56">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:shadow-md"
            >
              <option value="tokenId-asc">Token ID ↑</option>
              <option value="tokenId-desc">Token ID ↓</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {loading
          ? Array.from({ length: loadingCount }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          : filtered.map((nft) => (
              <button
                key={nft.listingId.toString()}
                type="button"
                onClick={() => onSelect?.(nft)}
                className={classNames(
                  "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition",
                  "hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300"
                )}
              >
                {/* Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                  <img
                    src={nft.tokenURI}
                    alt={`NFT #${nft.tokenId}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23ddd" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="sans-serif">No Image</text></svg>';
                    }}
                  />

                  {/* Top badge */}
                  <div className="absolute left-3 top-3">
                    <ListedPill listed={nft.active} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        NFT #{nft.tokenId}
                      </div>
                      <div className="truncate text-xs text-slate-600">
                        Listing #{nft.listingId.toString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-slate-900/5 p-2">
                      <div className="text-[10px] font-medium text-slate-600">
                        Price
                      </div>
                      <div className="mt-0.5 font-semibold text-slate-900 truncate">
                        {formatEth(nft.price)}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-900/5 p-2">
                      <div className="text-[10px] font-medium text-slate-600">
                        Status
                      </div>
                      <div className="mt-0.5 font-semibold text-slate-900">
                        {nft.active ? "For sale" : "Unlisted"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover affordance */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-slate-300" />
              </button>
            ))}
      </div>

      {/* Empty state */}
      {!loading && filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="mx-auto max-w-md">
            <div className="text-sm font-semibold text-slate-900">
              Nothing here
            </div>
            <div className="mt-1 text-sm text-slate-600">{empty}</div>
            <div className="mt-4 text-xs text-slate-500">
              Try changing your search or sort.
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}