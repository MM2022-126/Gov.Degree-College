import { useState, useEffect } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import PageSEO from "@/components/PageSEO";

interface MediaItem {
  _id: string;
  url: string;
  altText?: string;
  caption?: string;
  category: string;
}

const Gallery = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = [
    { value: "all", label: "All Photos" },
    { value: "campus", label: "Campus" },
    { value: "events", label: "Events" },
    { value: "sports", label: "Sports" },
    { value: "academics", label: "Academics" },
    { value: "faculty", label: "Faculty" },
    { value: "students", label: "Students" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "achievements", label: "Achievements" },
  ];

  useEffect(() => {
    setLoading(true);
    const url = activeCategory === "all"
      ? "http://localhost:3000/api/media?limit=100"
      : `http://localhost:3000/api/media?category=${activeCategory}&limit=100`;

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        // Handle both { media: [...] } and [...] response shapes
        const items = Array.isArray(data) ? data : (data.media ?? []);
        // DEBUG: Gallery loaded
        setMedia(items);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gallery fetch error:", err);
        setLoading(false);
      });
  }, [activeCategory]);

  if (loading) return (
    <PublicLayout>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <PageSEO
        title="Photo Gallery"
        description="Browse photos of campus, facilities, events, and student life at Government Graduate College, Ravi Road, Shahdara, Lahore."
        path="/gallery"
        keywords="GGC photos, college campus Lahore, Shahdara college gallery, campus facilities"
      />
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Gallery</h1>
          <p className="text-primary-foreground/80 text-lg">Explore our campus in pictures</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Count */}
          <p className="text-gray-400 text-sm mb-4">
            {media.length} photo{media.length !== 1 ? "s" : ""}
          </p>

          {/* Empty State */}
          {media.length === 0 && (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🖼️</p>
              <p className="text-gray-400">No photos in this category yet</p>
            </div>
          )}

          {/* Masonry Grid */}
          {media.length > 0 && (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
              {media.map((item, index) => (
                <div
                  key={item._id}
                  className="break-inside-avoid mb-3 cursor-pointer 
                             overflow-hidden rounded-xl group relative"
                  onClick={() => setLightboxIndex(index)}
                >
                  <img
                    src={item.url}
                    alt={item.altText || "GGC college photo"}
                    className="w-full object-cover group-hover:scale-105 
                               transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      // Hide broken images
                      e.currentTarget.parentElement!.style.display = "none";
                    }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 
                                  transition-colors duration-200 rounded-xl" />
                  {item.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t 
                                    from-black/60 to-transparent p-3 opacity-0 
                                    group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs">{item.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex flex-col"
          onClick={() => setLightboxIndex(null)}
        >
          <div className="flex justify-between items-center px-6 py-4 shrink-0">
            <span className="text-white/50 text-sm">
              {lightboxIndex + 1} / {media.length}
            </span>
            <button className="text-white text-2xl" 
                    onClick={() => setLightboxIndex(null)}>
              ✕
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-16"
               onClick={e => e.stopPropagation()}>
            <img
              src={media[lightboxIndex].url}
              alt={media[lightboxIndex].altText || "Gallery photo"}
              className="max-h-full max-w-full object-contain rounded-xl"
            />
          </div>

          {(media[lightboxIndex].caption || media[lightboxIndex].altText) && (
            <div className="text-center py-3 px-6 shrink-0">
              {media[lightboxIndex].caption && (
                <p className="text-white/80 text-sm">
                  {media[lightboxIndex].caption}
                </p>
              )}
              {media[lightboxIndex].altText && (
                <p className="text-white/40 text-xs mt-1">
                  {media[lightboxIndex].altText}
                </p>
              )}
            </div>
          )}

          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 
                         bg-white/10 hover:bg-white/20 text-white rounded-full 
                         w-12 h-12 flex items-center justify-center text-xl"
              onClick={e => { 
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
            >
              ‹
            </button>
          )}
          {lightboxIndex < media.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 
                         bg-white/10 hover:bg-white/20 text-white rounded-full 
                         w-12 h-12 flex items-center justify-center text-xl"
              onClick={e => { 
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </PublicLayout>
  );
};

export default Gallery;
