'use client'

import { useState, useRef, useEffect, useMemo } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Plus, Trash2, ArrowUp, ArrowDown, Upload, X, Loader2, Check, Edit } from "lucide-react";
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const API_URL = '/api';

interface Speaker {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  imageAlt: string;
}

interface ScheduleItem {
  time: string;
  activity: string;
  speaker: string;
}

interface Highlight {
  icon: string;
  label: string;
  value: string;
}

interface ContentSection {
  type: "text" | "highlight_box" | "quote" | "speakers" | "schedule" | "sponsors";
  heading: string;
  body: string;
  items?: Array<{ label?: string; value?: string; icon?: string }>;
}

interface GalleryImage {
  url: string;
  publicId: string;
  altText: string;
  caption: string;
  file?: File;
  preview?: string;
  uploaded: boolean;
}

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
  sections: ContentSection[];
  coverImage: { url: string; publicId: string; altText: string };
  images: GalleryImage[];
  videoUrl: string;
  videoTitle: string;
  highlights: Highlight[];
  speakers: Speaker[];
  schedule: ScheduleItem[];
  galleryHeading: string;
  registrationOpen: boolean;
  registrationLink: string;
  registrationDeadline?: string;
  tags: string[];
}

const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
    credentials: "include"
  });

  if (!response.ok) throw new Error("Upload failed");
  const data = await response.json();
  return { url: data.url, publicId: data.publicId };
};

const AdminEventsNew = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Event | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [editingSpeakerIdx, setEditingSpeakerIdx] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    tagline: "",
    category: "general",
    status: "upcoming" as const,
    isPublished: true,
    isFeatured: false,
    eventDate: "",
    endDate: "",
    time: "",
    venue: "",
    venueAddress: "",
    organizer: "",
    shortDescription: "",
    sections: [] as ContentSection[],
    coverImage: { url: "", publicId: "", altText: "" },
    images: [] as GalleryImage[],
    videoUrl: "",
    videoTitle: "",
    highlights: [] as Highlight[],
    speakers: [] as Speaker[],
    schedule: [] as ScheduleItem[],
    galleryHeading: "Event Photos",
    registrationOpen: false,
    registrationLink: "",
    registrationDeadline: "",
    tags: ""
  });

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const speakerPhotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents((data as Event[]) || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: !editing && !prev.slug.match(/^[^-]*-[^-]/) ? generateSlug(title) : prev.slug
    }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { url, publicId } = await uploadToCloudinary(file);
      setForm(prev => ({
        ...prev,
        coverImage: { ...prev.coverImage, url, publicId }
      }));
      toast({ title: "Cover image uploaded" });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const newImages: GalleryImage[] = [];

      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
        const { url, publicId } = await uploadToCloudinary(files[i]);
        newImages.push({
          url,
          publicId,
          altText: "",
          caption: "",
          uploaded: true
        });
      }

      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
      toast({ title: `${files.length} images uploaded` });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleSpeakerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || editingSpeakerIdx === null) return;

    try {
      setUploading(true);
      const { url, publicId } = await uploadToCloudinary(file);
      setForm(prev => ({
        ...prev,
        speakers: prev.speakers.map((s, i) =>
          i === editingSpeakerIdx
            ? { ...s, imageUrl: url }
            : s
        )
      }));
      toast({ title: "Speaker photo uploaded" });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      setEditingSpeakerIdx(null);
    }
  };

  const isValidVideoUrl = (url: string) => {
    return /youtube|vimeo|youtu\.be/.test(url);
  };

  const handleSaveEvent = async () => {
    if (!form.title || !form.eventDate) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    try {
      setUploading(true);
      const eventData = {
        ...form,
        tags: form.tags.split(",").map(t => t.trim()).filter(t => t),
        slug: form.slug || generateSlug(form.title)
      };

      if (editing) {
        await updateEvent(editing._id, eventData);
        toast({ title: "Event updated successfully" });
      } else {
        await createEvent(eventData);
        toast({ title: "Event created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      toast({ title: "Failed to save event", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Delete this event?")) return;

    try {
      await deleteEvent(id);
      toast({ title: "Event deleted" });
      fetchEvents();
    } catch (error) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      tagline: "",
      category: "general",
      status: "upcoming",
      isPublished: true,
      isFeatured: false,
      eventDate: "",
      endDate: "",
      time: "",
      venue: "",
      venueAddress: "",
      organizer: "",
      shortDescription: "",
      sections: [],
      coverImage: { url: "", publicId: "", altText: "" },
      images: [],
      videoUrl: "",
      videoTitle: "",
      highlights: [],
      speakers: [],
      schedule: [],
      galleryHeading: "Event Photos",
      registrationOpen: false,
      registrationLink: "",
      registrationDeadline: "",
      tags: ""
    });
    setEditing(null);
    setCurrentTab("basic");
  };

  const openEditDialog = (event: Event) => {
    setEditing(event);
    setForm({
      title: event.title,
      slug: event.slug,
      tagline: event.tagline,
      category: event.category,
      status: event.status,
      isPublished: event.isPublished,
      isFeatured: event.isFeatured,
      eventDate: event.eventDate?.split("T")[0] || "",
      endDate: event.endDate?.split("T")[0] || "",
      time: event.time,
      venue: event.venue,
      venueAddress: event.venueAddress,
      organizer: event.organizer,
      shortDescription: event.shortDescription,
      sections: event.sections || [],
      coverImage: event.coverImage,
      images: event.images || [],
      videoUrl: event.videoUrl,
      videoTitle: event.videoTitle,
      highlights: event.highlights || [],
      speakers: event.speakers || [],
      schedule: event.schedule || [],
      galleryHeading: event.galleryHeading,
      registrationOpen: event.registrationOpen,
      registrationLink: event.registrationLink,
      registrationDeadline: event.registrationDeadline?.split("T")[0] || "",
      tags: event.tags?.join(", ") || ""
    });
    setCurrentTab("basic");
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Event" : "Create New Event"}</DialogTitle>
              <DialogDescription>Build your event with rich content and media</DialogDescription>
            </DialogHeader>

            {/* Tabs */}
            <div className="flex gap-2 border-b mb-6 overflow-x-auto">
              {[
                { id: "basic", label: "Basic Info" },
                { id: "media", label: "Media" },
                { id: "details", label: "Details" },
                { id: "schedule", label: "Schedule & Speakers" },
                { id: "settings", label: "Settings" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`px-4 py-2 font-medium whitespace-nowrap ${
                    currentTab === tab.id
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: BASIC INFO */}
            {currentTab === "basic" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={form.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="Qawwali Night 2024"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Slug (auto-filled)</label>
                  <div className="flex gap-2">
                    <Input value={form.slug} readOnly className="bg-gray-100" />
                    <Button
                      variant="outline"
                      onClick={() => setForm(prev => ({ ...prev, slug: generateSlug(prev.title) }))}
                    >
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /events/{form.slug || "auto-slug"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Tagline</label>
                  <Input
                    value={form.tagline}
                    onChange={e => setForm(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="A night of soul-stirring Sufi music"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={form.category} onValueChange={v => setForm(prev => ({ ...prev, category: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["General", "Cultural", "Sports", "Academic", "Religious", "Prize Distribution", "Workshop", "Seminar", "Other"].map(c => (
                          <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={form.status} onValueChange={v => setForm(prev => ({ ...prev, status: v as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Short Description (for card) - {form.shortDescription.length}/200</label>
                  <Textarea
                    value={form.shortDescription}
                    onChange={e => setForm(prev => ({ ...prev, shortDescription: e.target.value.slice(0, 200) }))}
                    placeholder="Brief description shown on event cards"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Event Date *</label>
                    <Input
                      type="date"
                      value={form.eventDate}
                      onChange={e => setForm(prev => ({ ...prev, eventDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date (optional)</label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Time</label>
                  <Input
                    value={form.time}
                    onChange={e => setForm(prev => ({ ...prev, time: e.target.value }))}
                    placeholder="6:00 PM – 9:00 PM"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Venue</label>
                  <Input
                    value={form.venue}
                    onChange={e => setForm(prev => ({ ...prev, venue: e.target.value }))}
                    placeholder="Ravi Auditorium, GGC Shahdara"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Venue Address</label>
                  <Input
                    value={form.venueAddress}
                    onChange={e => setForm(prev => ({ ...prev, venueAddress: e.target.value }))}
                    placeholder="Full address with directions"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Organizer</label>
                  <Input
                    value={form.organizer}
                    onChange={e => setForm(prev => ({ ...prev, organizer: e.target.value }))}
                    placeholder="Cultural Society, GGC Ravi Road"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <Input
                    value={form.tags}
                    onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="music, cultural, 2024, qawwali"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: MEDIA */}
            {currentTab === "media" && (
              <div className="space-y-6">
                {/* Cover Image */}
                <div>
                  <h3 className="font-semibold mb-3">Cover Image</h3>
                  {form.coverImage.url ? (
                    <div className="relative">
                      <img src={form.coverImage.url} alt="Cover" className="w-full h-48 object-cover rounded-lg" />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setForm(prev => ({ ...prev, coverImage: { url: "", publicId: "", altText: "" } }))}
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => coverInputRef.current?.click()}
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>Click to upload cover image</p>
                    </div>
                  )}
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />

                  <div className="mt-3">
                    <label className="text-sm font-medium">Alt Text</label>
                    <Input
                      value={form.coverImage.altText}
                      onChange={e => setForm(prev => ({ ...prev, coverImage: { ...prev.coverImage, altText: e.target.value } }))}
                      placeholder="Students and faculty at the event banner"
                    />
                  </div>
                </div>

                {/* Gallery */}
                <div>
                  <h3 className="font-semibold mb-3">Photo Gallery</h3>

                  <div className="mb-3">
                    <label className="text-sm font-medium">Gallery Heading</label>
                    <Input
                      value={form.galleryHeading}
                      onChange={e => setForm(prev => ({ ...prev, galleryHeading: e.target.value }))}
                      placeholder="Event Photos"
                    />
                  </div>

                  <div
                    onClick={() => galleryInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 mb-4"
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>Click to upload photos (up to 30)</p>
                  </div>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />

                  {uploadProgress && <p className="text-sm text-blue-600 mb-3">{uploadProgress}</p>}

                  {form.images.length > 0 && (
                    <div className="space-y-3">
                      {form.images.map((img, idx) => (
                        <div key={idx} className="border rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <img src={img.url} alt="Gallery" className="w-16 h-16 object-cover rounded" />
                            <Button variant="ghost" size="sm" onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Input placeholder="Alt text" value={img.altText} onChange={e => setForm(prev => ({ ...prev, images: prev.images.map((x, i) => i === idx ? { ...x, altText: e.target.value } : x) }))} />
                          <Input placeholder="Caption" value={img.caption} onChange={e => setForm(prev => ({ ...prev, images: prev.images.map((x, i) => i === idx ? { ...x, caption: e.target.value } : x) }))} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video */}
                <div>
                  <h3 className="font-semibold mb-3">Video</h3>
                  <Input
                    value={form.videoUrl}
                    onChange={e => setForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Paste YouTube or Vimeo link</p>

                  <div className="mt-3">
                    <label className="text-sm font-medium">Video Title</label>
                    <Input
                      value={form.videoTitle}
                      onChange={e => setForm(prev => ({ ...prev, videoTitle: e.target.value }))}
                      placeholder="Highlights from the event"
                    />
                  </div>

                  {form.videoUrl && isValidVideoUrl(form.videoUrl) && (
                    <div className="mt-4 bg-black rounded-lg overflow-hidden">
                      <div className="relative pb-[56.25%]">
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={extractEmbedUrl(form.videoUrl)}
                          title="Preview"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: DETAILS */}
            {currentTab === "details" && (
              <div className="space-y-6">
                {/* Highlights */}
                <div>
                  <h3 className="font-semibold mb-3">Highlight Cards</h3>
                  <div className="space-y-3">
                    {form.highlights.map((h, idx) => (
                      <div key={idx} className="border rounded-lg p-3 space-y-2">
                        <Input
                          placeholder="Icon (emoji)"
                          value={h.icon}
                          onChange={e => setForm(prev => ({ ...prev, highlights: prev.highlights.map((x, i) => i === idx ? { ...x, icon: e.target.value } : x) }))}
                        />
                        <Input
                          placeholder="Label (e.g., 'Performers')"
                          value={h.label}
                          onChange={e => setForm(prev => ({ ...prev, highlights: prev.highlights.map((x, i) => i === idx ? { ...x, label: e.target.value } : x) }))}
                        />
                        <Input
                          placeholder="Value (e.g., '3 Groups')"
                          value={h.value}
                          onChange={e => setForm(prev => ({ ...prev, highlights: prev.highlights.map((x, i) => i === idx ? { ...x, value: e.target.value } : x) }))}
                        />
                        <Button variant="ghost" size="sm" onClick={() => setForm(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== idx) }))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {form.highlights.length < 6 && (
                    <Button variant="outline" className="w-full mt-3" onClick={() => setForm(prev => ({ ...prev, highlights: [...prev.highlights, { icon: "", label: "", value: "" }] }))}>
                      <Plus className="w-4 h-4 mr-2" /> Add Highlight
                    </Button>
                  )}
                </div>

                {/* Content Sections */}
                <div>
                  <h3 className="font-semibold mb-3">Content Sections</h3>
                  <div className="space-y-3">
                    {form.sections.map((sec, idx) => (
                      <div key={idx} className="border rounded-lg p-3 space-y-2">
                        <div className="flex gap-2">
                          <Select value={sec.type} onValueChange={t => setForm(prev => ({ ...prev, sections: prev.sections.map((x, i) => i === idx ? { ...x, type: t as any } : x) }))}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["text", "highlight_box", "quote", "speakers", "schedule", "sponsors"].map(t => (
                                <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex gap-1">
                            {idx > 0 && <Button size="sm" variant="ghost" onClick={() => setForm(prev => { const s = [...prev.sections]; [s[idx], s[idx-1]] = [s[idx-1], s[idx]]; return { ...prev, sections: s }; })}><ArrowUp className="w-4 h-4" /></Button>}
                            {idx < form.sections.length - 1 && <Button size="sm" variant="ghost" onClick={() => setForm(prev => { const s = [...prev.sections]; [s[idx], s[idx+1]] = [s[idx+1], s[idx]]; return { ...prev, sections: s }; })}><ArrowDown className="w-4 h-4" /></Button>}
                            <Button variant="ghost" size="sm" onClick={() => setForm(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== idx) }))}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        <Input placeholder="Heading" value={sec.heading} onChange={e => setForm(prev => ({ ...prev, sections: prev.sections.map((x, i) => i === idx ? { ...x, heading: e.target.value } : x) }))} />
                        <Textarea placeholder="Body text" value={sec.body} onChange={e => setForm(prev => ({ ...prev, sections: prev.sections.map((x, i) => i === idx ? { ...x, body: e.target.value } : x) }))} rows={3} />
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-3" onClick={() => setForm(prev => ({ ...prev, sections: [...prev.sections, { type: "text", heading: "", body: "", items: [] }] }))}>
                    <Plus className="w-4 h-4 mr-2" /> Add Section
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 4: SCHEDULE & SPEAKERS */}
            {currentTab === "schedule" && (
              <div className="space-y-6">
                {/* Schedule */}
                <div>
                  <h3 className="font-semibold mb-3">Programme Schedule</h3>
                  <div className="space-y-2">
                    {form.schedule.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <Input placeholder="Time (e.g., 6:00 PM)" value={item.time} onChange={e => setForm(prev => ({ ...prev, schedule: prev.schedule.map((x, i) => i === idx ? { ...x, time: e.target.value } : x) }))} />
                        <Input placeholder="Activity" value={item.activity} onChange={e => setForm(prev => ({ ...prev, schedule: prev.schedule.map((x, i) => i === idx ? { ...x, activity: e.target.value } : x) }))} />
                        <Input placeholder="Speaker" value={item.speaker} onChange={e => setForm(prev => ({ ...prev, schedule: prev.schedule.map((x, i) => i === idx ? { ...x, speaker: e.target.value } : x) }))} />
                        <Button variant="ghost" size="sm" onClick={() => setForm(prev => ({ ...prev, schedule: prev.schedule.filter((_, i) => i !== idx) }))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-3" onClick={() => setForm(prev => ({ ...prev, schedule: [...prev.schedule, { time: "", activity: "", speaker: "" }] }))}>
                    <Plus className="w-4 h-4 mr-2" /> Add Row
                  </Button>
                </div>

                {/* Speakers */}
                <div>
                  <h3 className="font-semibold mb-3">Performers & Guests</h3>
                  <div className="space-y-3">
                    {form.speakers.map((speaker, idx) => (
                      <div key={idx} className="border rounded-lg p-3 space-y-2">
                        <Input
                          placeholder="Name *"
                          value={speaker.name}
                          onChange={e => setForm(prev => ({ ...prev, speakers: prev.speakers.map((x, i) => i === idx ? { ...x, name: e.target.value } : x) }))}
                        />
                        <Input
                          placeholder="Role (e.g., 'Chief Performer')"
                          value={speaker.role}
                          onChange={e => setForm(prev => ({ ...prev, speakers: prev.speakers.map((x, i) => i === idx ? { ...x, role: e.target.value } : x) }))}
                        />
                        <Textarea
                          placeholder="Bio"
                          value={speaker.bio}
                          onChange={e => setForm(prev => ({ ...prev, speakers: prev.speakers.map((x, i) => i === idx ? { ...x, bio: e.target.value } : x) }))}
                          rows={2}
                        />
                        {speaker.imageUrl && (
                          <img src={speaker.imageUrl} alt="Speaker" className="w-16 h-16 object-cover rounded" />
                        )}
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditingSpeakerIdx(idx);
                          speakerPhotoRef.current?.click();
                        }}>
                          Upload Photo
                        </Button>
                        <Input
                          placeholder="Image Alt Text"
                          value={speaker.imageAlt}
                          onChange={e => setForm(prev => ({ ...prev, speakers: prev.speakers.map((x, i) => i === idx ? { ...x, imageAlt: e.target.value } : x) }))}
                        />
                        <Button variant="ghost" size="sm" onClick={() => setForm(prev => ({ ...prev, speakers: prev.speakers.filter((_, i) => i !== idx) }))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-3" onClick={() => setForm(prev => ({ ...prev, speakers: [...prev.speakers, { name: "", role: "", bio: "", imageUrl: "", imageAlt: "" }] }))}>
                    <Plus className="w-4 h-4 mr-2" /> Add Person
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 5: SETTINGS */}
            {currentTab === "settings" && (
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={e => setForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Published (visible to public)</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={e => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Featured (show on homepage)</span>
                </label>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Registration</h3>
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={form.registrationOpen}
                      onChange={e => setForm(prev => ({ ...prev, registrationOpen: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Open Registration</span>
                  </label>

                  {form.registrationOpen && (
                    <>
                      <Input
                        placeholder="Registration Link"
                        value={form.registrationLink}
                        onChange={e => setForm(prev => ({ ...prev, registrationLink: e.target.value }))}
                        className="mb-3"
                      />
                      <div>
                        <label className="text-sm font-medium">Registration Deadline</label>
                        <Input
                          type="date"
                          value={form.registrationDeadline}
                          onChange={e => setForm(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                        />
                      </div>
                    </>
                  )}
                </div>

                {editing && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold text-red-600 mb-3">Danger Zone</h3>
                    <Button variant="destructive" className="w-full" onClick={() => { if (window.confirm("Type the event title to confirm deletion:")) handleDeleteEvent(editing._id); setDialogOpen(false); }}>
                      Delete Event
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Hidden File Inputs */}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
            />
            <input
              ref={speakerPhotoRef}
              type="file"
              accept="image/*"
              onChange={handleSpeakerPhotoUpload}
              className="hidden"
            />

            {/* Save Button */}
            <div className="flex gap-2 mt-6 pt-4 border-t sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEvent} disabled={uploading} className="flex-1">
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                {uploading ? "Saving..." : "Save Event"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : (
        <div className="grid gap-4">
          {events.map(event => (
            <Card key={event._id}>
              <CardContent className="p-4 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-gray-500">{event.category} • {new Date(event.eventDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(event)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(event._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

const extractEmbedUrl = (url: string): string => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return url;
};

export default AdminEventsNew;
