'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import PublicLayout from "@/components/layout/PublicLayout";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { getEvents } from "@/lib/api";
import auditoriumGate from "@/assets/auditorium-gate.jpeg";

interface Event {
  _id: string;
  title: string;
  slug: string;
  tagline?: string;
  category?: string;
  status?: "upcoming" | "ongoing" | "completed";
  eventDate: string;
  date?: string;
  time?: string;
  venue?: string;
  shortDescription?: string;
  description?: string;
  coverImage?: { url: string; altText: string };
  imageUrl?: string;
  images?: Array<{ url: string; altText: string; caption: string }>;
  videoUrl?: string;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents().then((data) => {
      setEvents((data as Event[]) || []);
      setLoading(false);
    }).catch((error) => {
      console.error('Failed to fetch events:', error);
      setLoading(false);
    });
  }, []);

  const getEventImage = (event: Event) => {
    return event.coverImage?.url || event.imageUrl || auditoriumGate;
  };

  const getEventUrl = (event: Event) => {
    return event.slug ? `/events/${event.slug}` : '#';
  };

  return (
    <PublicLayout>
      <PageSEO
        title="Events"
        description="Upcoming events, seminars, sports galas, and cultural activities at Government Graduate College, Ravi Road, Shahdara, Lahore."
        path="/events"
        keywords="GGC events, college events Lahore, sports gala, science exhibition, seminars Shahdara"
      />
      <section className="relative bg-primary py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={auditoriumGate.src} alt="Ravi Auditorium at Government Graduate College Shahdara" loading="eager" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Events</h1>
          <p className="text-primary-foreground/80 text-lg">Discover upcoming events and activities</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No upcoming events at this time.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const imageUrl = getEventImage(event);
                const detailUrl = getEventUrl(event);
                const eventDate = new Date(event.eventDate || event.date || '');

                return (
                  <Link key={event._id} to={detailUrl} className="group">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
                      {/* Cover Image */}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                        {imageUrl ? (
                          <>
                            <img
                              src={imageUrl}
                              alt={event.coverImage?.altText || event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl">📅</span>
                          </div>
                        )}

                        {/* Status Badge */}
                        {event.status && (
                          <span
                            className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ${
                              event.status === "upcoming"
                                ? "bg-green-100 text-green-700"
                                : event.status === "ongoing"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        )}
                      </div>

                      {/* Card Body */}
                      <CardContent className="p-5 flex-1 flex flex-col">
                        {event.category && (
                          <span className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-2">
                            {event.category}
                          </span>
                        )}

                        <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {event.title}
                        </h3>

                        {event.tagline && (
                          <p className="text-gray-500 text-sm mb-3 line-clamp-1">{event.tagline}</p>
                        )}

                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                          {event.shortDescription || event.description || "Click to view event details"}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {eventDate.toLocaleDateString("en-PK", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                          {event.venue && <span className="truncate ml-2 max-w-[150px]">{event.venue}</span>}
                        </div>

                        {/* Photo and video count */}
                        <div className="flex gap-3 mt-3 text-xs text-gray-400">
                          {event.images?.length ? (
                            <span>📷 {event.images.length} photos</span>
                          ) : null}
                          {event.videoUrl ? <span>🎥 Video</span> : null}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default Events;
