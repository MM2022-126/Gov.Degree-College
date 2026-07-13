import { useState, useRef, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Calendar, ImagePlus, X, Loader2, Upload } from "lucide-react";
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { VideoPlayer } from "@/components/VideoPlayer";

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
  description: string;
  fullContent?: string;
  eventDate: string;
  endDate?: string;
  venue?: string;
  organizer?: string;
  coverImage?: { url: string; altText: string };
  images?: GalleryImage[];
  videoUrl?: string;
  videoTitle?: string;
  category?: string;
  isPublished?: boolean;
  // Legacy fields
  date?: string;
  time?: string;
  imageUrl?: string;
  video_url?: string;
}

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Event | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    fullContent: "",
    eventDate: "",
    endDate: "",
    venue: "",
    organizer: "",
    category: "general",
    isPublished: true,
    coverImageFile: null as File | null,
    coverImagePreview: "",
    coverImageAlt: "",
    galleryImages: [] as GalleryImage[],
    videoUrl: "",
    videoTitle: "",
  });

  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents((data as Event[]) || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch events", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const generateSlug = (title: string) =>
    title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');

  const openNew = () => {
    setEditing(null);
    setForm({
      title: "", slug: "", description: "", fullContent: "", eventDate: "", endDate: "",
      venue: "", organizer: "", category: "general", isPublished: true,
      coverImageFile: null, coverImagePreview: "", coverImageAlt: "",
      galleryImages: [], videoUrl: "", videoTitle: ""
    });
    setDialogOpen(true);
  };

  const openEdit = (event: Event) => {
    setEditing(event);
    setForm({
      title: event.title,
      slug: event.slug,
      description: event.description,
      fullContent: event.fullContent || "",
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : "",
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : "",
      venue: event.venue || "",
      organizer: event.organizer || "",
      category: event.category || "general",
      isPublished: event.isPublished !== false,
      coverImageFile: null,
      coverImagePreview: event.coverImage?.url || "",
      coverImageAlt: event.coverImage?.altText || "",
      galleryImages: event.images || [],
      videoUrl: event.videoUrl || "",
      videoTitle: event.videoTitle || "",
    });
    setDialogOpen(true);
  };

  const handleCoverImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: "Error", description: "Only image files allowed", variant: "destructive" });
      return;
    }
    setForm(prev => ({ ...prev, coverImageFile: file }));
    const reader = new FileReader();
    reader.onload = (e) => setForm(prev => ({ ...prev, coverImagePreview: e.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleMultipleImageSelect = (files: FileList | null) => {
    if (!files) return;
    const newItems: GalleryImage[] = Array.from(files).map(file => ({
      url: '',
      publicId: '',
      altText: '',
      caption: '',
      file,
      preview: URL.createObjectURL(file),
      uploaded: false
    }));
    setForm(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...newItems] }));
  };

  const updateGalleryItem = (index: number, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.map((img, i) =>
        i === index ? { ...img, [field]: value } : img
      )
    }));
  };

  const removeGalleryItem = (index: number) => {
    setForm(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
    const { uploadToCloudinary: upload } = await import('@/lib/cloudinary-client');
    return upload(file);
  };

  const handleSave = async () => {
    if (!form.title || !form.eventDate) {
      toast({ title: "Error", description: "Title and date are required", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    setUploadStatus("Preparing event...");

    try {
      // 1. Upload cover image if new
      let coverImageData: any = null;
      if (form.coverImageFile) {
        setUploadStatus("Uploading cover image...");
        const { url, publicId } = await uploadToCloudinary(form.coverImageFile);
        coverImageData = { url, altText: form.coverImageAlt, publicId };
      } else if (form.coverImagePreview) {
        coverImageData = { url: form.coverImagePreview, altText: form.coverImageAlt };
      }

      // 2. Upload gallery images
      const uploadedGallery = await Promise.all(
        form.galleryImages.map(async (img, i) => {
          if (img.uploaded || !img.file) return img;
          setUploadStatus(`Uploading photo ${i + 1} of ${form.galleryImages.length}...`);
          const { url, publicId } = await uploadToCloudinary(img.file);
          return { url, publicId, altText: img.altText, caption: img.caption, uploaded: true };
        })
      );

      // 3. Prepare event data
      const eventData = {
        title: form.title,
        slug: form.slug || generateSlug(form.title),
        description: form.description,
        fullContent: form.fullContent,
        eventDate: new Date(form.eventDate),
        endDate: form.endDate ? new Date(form.endDate) : undefined,
        venue: form.venue,
        organizer: form.organizer,
        category: form.category,
        isPublished: form.isPublished,
        coverImage: coverImageData,
        images: uploadedGallery.map(({ file, preview, uploaded, ...rest }) => rest),
        videoUrl: form.videoUrl,
        videoTitle: form.videoTitle,
      };

      // 4. Save or update
      setUploadStatus("Saving event...");
      const isEditing = !!editing;
      if (isEditing) {
        await updateEvent(editing!._id, eventData);
        toast({ title: "Event updated successfully!" });
      } else {
        await createEvent(eventData);
        toast({ title: "Event created successfully!" });
      }

      setDialogOpen(false);
      fetchEvents();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save event",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
      setUploadStatus("");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      await deleteEvent(id);
      toast({ title: "Event deleted" });
      fetchEvents();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
    }
  };

  if (loading) return <AdminLayout><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AdminLayout>;

  const isValidVideoUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.endsWith('.mp4');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">Manage Events</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" /> Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-display">{editing ? "Edit Event" : "Add New Event"}</DialogTitle>
                <DialogDescription className="sr-only">Form to create or edit an event</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* BASIC INFO */}
                <div>
                  <h3 className="font-semibold mb-3">Basic Information</h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Event Title"
                      value={form.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setForm({ ...form, title, slug: editing ? form.slug : generateSlug(title) });
                      }}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={form.eventDate}
                        onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                      />
                      <Input
                        type="date"
                        placeholder="End Date (optional)"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      />
                    </div>
                    <Input
                      placeholder="Venue"
                      value={form.venue}
                      onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    />
                    <Input
                      placeholder="Organizer"
                      value={form.organizer}
                      onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                    />
                    <Textarea
                      placeholder="Short Description (for cards)"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="h-20"
                    />
                    <Textarea
                      placeholder="Full Content (for detail page)"
                      value={form.fullContent}
                      onChange={(e) => setForm({ ...form, fullContent: e.target.value })}
                      className="h-24"
                    />
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="general">General</option>
                      <option value="academic">Academic</option>
                      <option value="sports">Sports</option>
                      <option value="cultural">Cultural</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* COVER IMAGE */}
                <div>
                  <h3 className="font-semibold mb-3">Cover Image</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">This image shows on the event card</p>
                    <div
                      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                      onClick={() => coverInputRef.current?.click()}
                    >
                      {form.coverImagePreview ? (
                        <img src={form.coverImagePreview} alt="Cover" className="max-h-24 mx-auto rounded" />
                      ) : (
                        <div className="text-gray-400 text-sm">Click to select cover image</div>
                      )}
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleCoverImageSelect(e.target.files[0])}
                        className="hidden"
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="Cover image alt text"
                      value={form.coverImageAlt}
                      onChange={(e) => setForm({ ...form, coverImageAlt: e.target.value })}
                      maxLength={125}
                    />
                  </div>
                </div>

                {/* GALLERY */}
                <div>
                  <h3 className="font-semibold mb-3">Event Photo Gallery</h3>
                  <p className="text-sm text-gray-500 mb-3">Add photos from this event</p>
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full border-2 border-dashed rounded-lg px-4 py-3 text-gray-500 hover:border-blue-400 mb-3"
                  >
                    Click to add photos (select multiple at once)
                  </button>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleMultipleImageSelect(e.target.files)}
                    className="hidden"
                  />

                  <div className="space-y-2">
                    {form.galleryImages.map((img, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <img
                          src={img.preview || img.url}
                          alt={img.altText}
                          className="w-full h-20 object-cover rounded mb-2"
                        />
                        <Input
                          type="text"
                          placeholder="Alt text (required)"
                          value={img.altText}
                          onChange={(e) => updateGalleryItem(index, 'altText', e.target.value)}
                          className="w-full text-sm mb-1"
                          maxLength={125}
                        />
                        <Input
                          type="text"
                          placeholder="Caption (optional)"
                          value={img.caption}
                          onChange={(e) => updateGalleryItem(index, 'caption', e.target.value)}
                          className="w-full text-sm mb-2"
                        />
                        {img.uploaded && (
                          <span className="text-xs text-green-600 font-medium">Uploaded</span>
                        )}
                        <button
                          onClick={() => removeGalleryItem(index)}
                          className="text-red-500 text-xs hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VIDEO */}
                <div>
                  <h3 className="font-semibold mb-3">Event Video</h3>
                  <p className="text-sm text-gray-500 mb-2">Paste a YouTube or Vimeo link</p>
                  <Input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    className="mb-2"
                  />
                  <Input
                    type="text"
                    placeholder="Video title (optional)"
                    value={form.videoTitle}
                    onChange={(e) => setForm({ ...form, videoTitle: e.target.value })}
                    className="mb-3"
                  />
                  {form.videoUrl && isValidVideoUrl(form.videoUrl) && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Preview:</p>
                      <VideoPlayer url={form.videoUrl} title={form.videoTitle || form.title} />
                    </div>
                  )}
                </div>

                {/* SUBMIT */}
                <div>
                  {uploadStatus && (
                    <p className="text-sm text-blue-600 mb-3 flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {uploadStatus}
                    </p>
                  )}
                  <Button
                    className="w-full"
                    onClick={handleSave}
                    disabled={submitting || !form.title || !form.eventDate}
                  >
                    {submitting ? "Saving..." : editing ? "Update Event" : "Create Event"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {events.length === 0 && <p className="text-center text-muted-foreground py-8">No events yet.</p>}

        <div className="space-y-3">
          {events.map(event => (
            <Card key={event._id} className="border border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {event.coverImage?.url || event.imageUrl ? (
                    <img src={event.coverImage?.url || event.imageUrl} alt="" className="h-12 w-12 rounded-md object-cover" />
                  ) : (
                    <Calendar className="h-8 w-8 text-secondary" />
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.eventDate || event.date || '').toLocaleDateString()}
                      {event.venue && ` • ${event.venue}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(event)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(event._id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;
