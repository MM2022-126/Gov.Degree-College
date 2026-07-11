import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Image as ImageIcon, Calendar } from "lucide-react";
import { getEventGalleries, createEventGallery, updateEventGallery, deleteEventGallery, addImagesToGallery, removeImageFromGallery, uploadImage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface EventImage {
  url: string;
  publicId?: string;
  caption?: string;
}

interface EventGallery {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  coverImage: string;
  images: EventImage[];
  slug: string;
  createdAt: string;
}

const AdminEventGallery = () => {
  const { toast } = useToast();
  const [galleries, setGalleries] = useState<EventGallery[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<EventGallery | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    coverImage: "",
    images: [] as EventImage[],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchGalleries = async () => {
    try {
      const data = await getEventGalleries();
      setGalleries(data || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch galleries", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const handleImageUpload = async (files: FileList, isCover = false) => {
    if (!files) return;
    
    setUploading(true);
    const newImages: EventImage[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const response = await uploadImage(file);
        
        newImages.push({
          url: response.url,
          publicId: response.publicId,
          caption: "",
        });
        
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      if (isCover && newImages.length > 0) {
        setForm({ ...form, coverImage: newImages[0].url });
        toast({ title: "Cover image uploaded" });
      } else {
        setForm({ ...form, images: [...form.images, ...newImages] });
        toast({ title: `${newImages.length} image(s) uploaded` });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload images", variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const saveGallery = async () => {
    if (!form.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    try {
      if (editingGallery) {
        await updateEventGallery(editingGallery._id, form);
        toast({ title: "Gallery updated" });
      } else {
        await createEventGallery(form);
        toast({ title: "Gallery created" });
      }
      setDialogOpen(false);
      setEditingGallery(null);
      setForm({ title: "", description: "", eventDate: "", coverImage: "", images: [] });
      fetchGalleries();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this gallery?")) return;
    
    try {
      await deleteEventGallery(id);
      toast({ title: "Gallery deleted" });
      fetchGalleries();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const openEditGallery = (gallery: EventGallery) => {
    setEditingGallery(gallery);
    setForm({
      title: gallery.title,
      description: gallery.description,
      eventDate: gallery.eventDate?.split("T")[0] || "",
      coverImage: gallery.coverImage,
      images: gallery.images,
    });
    setDialogOpen(true);
  };

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Event Galleries</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingGallery(null);
              setForm({ title: "", description: "", eventDate: "", coverImage: "", images: [] });
            }
          }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Gallery</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingGallery ? "Edit" : "Create"} Event Gallery</DialogTitle>
                <DialogDescription className="sr-only">
                  {editingGallery ? "Edit gallery details" : "Create a new event gallery with images"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Gallery Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Annual Sports Day 2026"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Gallery description..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Event Date</Label>
                  <Input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Cover Image</Label>
                  {form.coverImage && (
                    <div className="mb-2 relative w-full h-32 rounded-lg overflow-hidden">
                      <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setForm({ ...form, coverImage: "" })}
                        className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files, true)}
                      className="hidden"
                      id="cover-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="cover-upload">
                      <Button asChild disabled={uploading} variant="outline" className="w-full">
                        <span>
                          {uploading ? `Uploading... ${uploadProgress}%` : "Upload Cover Image"}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Gallery Images ({form.images.length})</Label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img.url} alt={`Image ${idx}`} className="w-full h-24 object-cover rounded" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity rounded"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files, false)}
                      className="hidden"
                      id="gallery-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="gallery-upload">
                      <Button asChild disabled={uploading} variant="outline" className="w-full">
                        <span>
                          {uploading ? `Uploading... ${uploadProgress}%` : "Add Images"}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                <Button onClick={saveGallery} className="w-full" disabled={!form.title.trim()}>
                  {editingGallery ? "Update Gallery" : "Create Gallery"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {galleries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No event galleries yet. Create your first gallery to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleries.map((gallery) => (
              <Card key={gallery._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {gallery.coverImage && (
                  <div className="relative h-40 overflow-hidden bg-gray-100">
                    <img src={gallery.coverImage} alt={gallery.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">{gallery.title}</CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {gallery.eventDate ? new Date(gallery.eventDate).toLocaleDateString() : "No date"}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{gallery.description}</p>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      {gallery.images.length} photos
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditGallery(gallery)}>
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-destructive" onClick={() => handleDelete(gallery._id)}>
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEventGallery;
