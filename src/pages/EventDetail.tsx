import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Calendar, MapPin, User, ChevronLeft, ChevronRight, X } from "lucide-react";
import { getEventBySlug } from "@/lib/api";

interface Event {
  _id: string;
  title: string;
  slug: string;
  tagline: string;
  category: string;
  status: "upcoming" | "ongoing" | "completed";
  isPublished: boolean;
  isFeatured: boolean;
  eventDate: string;
  endDate?: string;
  time: string;
  venue: string;
  venueAddress: string;
  organizer: string;
  shortDescription: string;
  sections: Array<{
    type: string;
    heading: string;
    body: string;
    items?: Array<{ label?: string; value?: string; icon?: string }>;
  }>;
  coverImage: { url: string; publicId: string; altText: string };
  images: Array<{ url: string; publicId: string; altText: string; caption: string }>;
  videoUrl: string;
  videoTitle: string;
  highlights: Array<{ icon: string; label: string; value: string }>;
  speakers: Array<{
    name: string;
    role: string;
    bio: string;
    imageUrl: string;
    imageAlt: string;
  }>;
  schedule: Array<{ time: string; activity: string; speaker: string }>;
  galleryHeading: string;
  registrationOpen: boolean;
  registrationLink: string;
  registrationDeadline?: string;
  tags: string[];
}

const EventDetailSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-96 bg-gray-200 w-full" />
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

const extractEmbedUrl = (url: string): string => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return url;
};

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  const fetchEvent = async () => {
    try {
      const data = await getEventBySlug(slug!);
      setEvent(data as Event);
    } catch (err) {
      console.error("Failed to fetch event:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLightboxKeyboard = (e: React.KeyboardEvent) => {
    if (!event?.images) return;
    if (e.key === "ArrowRight" && lightboxIndex !== null && lightboxIndex < event.images.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
    if (e.key === "ArrowLeft" && lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
    if (e.key === "Escape") {
      setLightboxIndex(null);
    }
  };

  useEffect(() => {
    if (lightboxIndex !== null) {
      lightboxRef.current?.focus();
    }
  }, [lightboxIndex]);

  if (loading) return <PublicLayout><EventDetailSkeleton /></PublicLayout>;

  if (error || !event) {
    return (
      <PublicLayout>
        <div className="text-center py-20">
          <p className="text-6xl mb-4">📅</p>
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-gray-500 mb-6">
            This event may have been removed or the link is incorrect.
          </p>
          <Link
            to="/events"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700"
          >
            View All Events
          </Link>
        </div>
      </PublicLayout>
    );
  }

  // Apply null safety to all array fields
  const safeEvent = event ? {
    ...event,
    highlights: event.highlights ?? [],
    images: event.images ?? [],
    speakers: event.speakers ?? [],
    schedule: event.schedule ?? [],
    sections: event.sections ?? [],
    tags: event.tags ?? [],
    coverImage: event.coverImage ?? { url: "", altText: "" },
    videoUrl: event.videoUrl ?? "",
    videoTitle: event.videoTitle ?? "",
  } : null;

  return (
    <PublicLayout>
      {/* HERO SECTION */}
      <section
        className="relative h-96 md:h-screen md:min-h-screen flex items-end bg-cover bg-center"
        style={{
          backgroundImage: safeEvent?.coverImage?.url
            ? `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${safeEvent.coverImage.url}')`
            : "linear-gradient(to bottom right, #3b82f6, #1e40af)"
        }}
      >
        <Link
          to="/events"
          className="absolute top-4 left-4 md:top-8 md:left-8 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">All Events</span>
        </Link>

        <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              event.status === "upcoming"
                ? "bg-green-100 text-green-700"
                : event.status === "ongoing"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
            {event.category}
          </span>
        </div>

        <div className="relative z-10 container mx-auto px-4 pb-8 md:pb-16">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
            {safeEvent?.title}
          </h1>
          {safeEvent?.tagline && <p className="text-lg text-white/80 mb-4">{safeEvent.tagline}</p>}
          <div className="flex flex-col sm:flex-row gap-4 text-white">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {safeEvent?.eventDate && new Date(safeEvent.eventDate).toLocaleDateString("en-PK", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
              {safeEvent?.time && <span>• {safeEvent.time}</span>}
            </div>
            {safeEvent?.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {safeEvent.venue}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* META BAR */}
      <div className="bg-blue-50 border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>
                {new Date(event.eventDate).toLocaleDateString("en-PK", {
                  month: "short",
                  day: "numeric"
                })}
              </span>
            </div>
            {event.time && (
              <div className="flex items-center gap-2">
                <span className="text-blue-600">🕐</span>
                <span>{event.time}</span>
              </div>
            )}
            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="truncate">{event.venue}</span>
              </div>
            )}
            {event.organizer && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="truncate">{event.organizer}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HIGHLIGHT CARDS */}
      {safeEvent?.highlights && safeEvent.highlights.length > 0 && (
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {safeEvent.highlights.map((h, idx) => (
                <Card key={idx} className="border shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-2">{h.icon}</div>
                    <div className="text-2xl font-bold text-gray-800">{h.value}</div>
                    <div className="text-sm text-gray-500 mt-1">{h.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MAIN CONTENT */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Short Description */}
          {event.shortDescription && (
            <div className="mb-12 p-6 bg-blue-50 rounded-2xl">
              <p className="text-lg text-gray-700 leading-relaxed">{event.shortDescription}</p>
            </div>
          )}

          {/* Content Sections */}
          {event.sections && event.sections.length > 0 && (
            <div className="mb-12 space-y-8">
              {event.sections.map((section, idx) => (
                <div key={idx}>
                  {section.type === "text" && (
                    <>
                      {section.heading && (
                        <h2 className="text-3xl font-bold mb-4">{section.heading}</h2>
                      )}
                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {section.body}
                      </p>
                    </>
                  )}

                  {section.type === "highlight_box" && (
                    <div className="bg-blue-50 border-l-4 border-blue-600 rounded-xl p-6">
                      {section.heading && (
                        <h3 className="font-bold text-blue-800 mb-2">{section.heading}</h3>
                      )}
                      <p className="text-blue-700 whitespace-pre-wrap">{section.body}</p>
                    </div>
                  )}

                  {section.type === "quote" && (
                    <blockquote className="border-l-4 border-gray-300 pl-6 py-2 my-6">
                      <p className="text-xl italic text-gray-600">"{section.body}"</p>
                      {section.items?.[0]?.label && (
                        <cite className="text-sm text-gray-400 mt-2 block">
                          — {section.items[0].label}
                        </cite>
                      )}
                    </blockquote>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SCHEDULE TIMELINE */}
          {safeEvent?.schedule && safeEvent.schedule.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-8">Programme Schedule</h2>
              <div className="relative">
                <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-gray-200" />
                {safeEvent.schedule.map((item, i) => (
                  <div key={i} className="flex gap-6 mb-6 relative">
                    <div className="w-14 text-right shrink-0">
                      <span className="text-sm font-mono text-blue-600 font-semibold">
                        {item.time}
                      </span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-blue-600 mt-1 shrink-0 z-10" />
                    <div className="pb-2">
                      <p className="font-semibold text-gray-800">{item.activity}</p>
                      {item.speaker && (
                        <p className="text-sm text-gray-500 mt-0.5">{item.speaker}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SPEAKERS / PERFORMERS */}
          {safeEvent?.speakers && safeEvent.speakers.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-8">Performers & Guests</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {safeEvent.speakers.map((person, i) => (
                  <div key={i} className="text-center">
                    {person.imageUrl ? (
                      <img
                        src={person.imageUrl}
                        alt={person.imageAlt || person.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-2 border-gray-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center text-3xl">
                        👤
                      </div>
                    )}
                    <p className="font-semibold text-gray-800">{person.name}</p>
                    <p className="text-sm text-blue-600">{person.role}</p>
                    {person.bio && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{person.bio}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMBEDDED VIDEO */}
          {safeEvent?.videoUrl && (
            <div className="mb-12 rounded-2xl overflow-hidden bg-black">
              <h2 className="px-6 pt-6 text-white font-bold text-xl">
                {safeEvent.videoTitle || "Event Video"}
              </h2>
              <div className="relative" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={extractEmbedUrl(safeEvent.videoUrl)}
                  title={safeEvent.videoTitle || safeEvent?.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* PHOTO GALLERY */}
          {safeEvent?.images && safeEvent.images.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-2">{safeEvent.galleryHeading}</h2>
              <p className="text-gray-400 text-sm mb-6">{safeEvent.images.length} photos</p>

              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))"
                }}
              >
                {safeEvent.images.map((img, index) => (
                  <div
                    key={index}
                    className="cursor-pointer overflow-hidden rounded-xl group relative"
                    onClick={() => setLightboxIndex(index)}
                  >
                    <img
                      src={img.url}
                      alt={img.altText || `${safeEvent.title} photo ${index + 1}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {img.caption && (
                      <p className="text-xs text-gray-600 px-2 py-1 bg-white/80 absolute bottom-0 left-0 right-0">
                        {img.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REGISTRATION CTA */}
          {safeEvent?.registrationOpen && safeEvent?.registrationLink && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-center text-white mb-12">
              <h2 className="text-2xl font-bold mb-2">Register for This Event</h2>
              {safeEvent.registrationDeadline && (
                <p className="text-blue-100 mb-4">
                  Registration closes:{" "}
                  {new Date(safeEvent.registrationDeadline).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              )}
              <a
                href={safeEvent.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors"
              >
                Register Now
              </a>
            </div>
          )}
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightboxIndex !== null && safeEvent?.images && safeEvent.images.length > 0 && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex flex-col"
          onKeyDown={handleLightboxKeyboard}
          tabIndex={0}
          ref={lightboxRef}
        >
          {/* Top bar */}
          <div className="flex justify-between items-center px-6 py-4">
            <span className="text-white/60 text-sm">
              {lightboxIndex + 1} / {safeEvent.images.length}
            </span>
            <button
              onClick={() => setLightboxIndex(null)}
              className="text-white text-2xl hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center px-4 md:px-16">
            <img
              src={safeEvent.images[lightboxIndex].url}
              alt={safeEvent.images[lightboxIndex].altText || "Event photo"}
              className="max-h-full max-w-full object-contain rounded-xl"
            />
          </div>

          {/* Caption */}
          {safeEvent.images[lightboxIndex].caption && (
            <div className="text-center text-white/70 text-sm py-3 px-6">
              {safeEvent.images[lightboxIndex].caption}
            </div>
          )}

          {/* Alt text */}
          <div className="text-center text-white/30 text-xs pb-4 px-6">
            {safeEvent.images[lightboxIndex].altText}
          </div>

          {/* Navigation */}
          {lightboxIndex > 0 && (
            <button
              onClick={() => setLightboxIndex(lightboxIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {lightboxIndex < safeEvent.images.length - 1 && (
            <button
              onClick={() => setLightboxIndex(lightboxIndex + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </PublicLayout>
  );
};

export default EventDetail;
