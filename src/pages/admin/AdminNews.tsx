import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Newspaper, ImagePlus, X, Loader2 } from "lucide-react";
import { getNews, createNews, updateNews, deleteNews, uploadImage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  priority: string;
  date: string;
  imageUrl?: string;
  videoUrl?: string;
  images: string[];
  video_url?: string;
}

const AdminNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState({ 
    title: "", 
    excerpt: "", 
    category: "Academic", 
    priority: "normal", 
    date: "", 
    imageUrl: "",
    imageAlt: "",
    videoUrl: "",
    images: [] as string[]
  });
  const { toast } = useToast();

  const fetchNews = async () => {
    try {
      const data = await getNews();
      setNews((data as any[]) || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch news", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchNews(); }, []);

  const openNew = () => { 
    setEditing(null); 
    setForm({ title: "", excerpt: "", category: "Academic", priority: "normal", date: "", imageUrl: "", imageAlt: "", videoUrl: "", images: [] }); 
    setDialogOpen(true); 
  };
  
  const openEdit = (item: NewsItem) => { 
    setEditing(item); 
    setForm({ 
      title: item.title, 
      excerpt: item.excerpt || "", 
      category: item.category || "Academic", 
      priority: item.priority || "normal", 
      date: item.date, 
      imageUrl: item.imageUrl || "",
      imageAlt: (item as any).imageAlt || "",
      videoUrl: item.videoUrl || "",
      images: item.images || [] 
    }); 
    setDialogOpen(true); 
  };

  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { url } = await uploadImage(file);
        
        // Set first image as cover image (imageUrl)
        if (i === 0) {
          setForm(prev => ({ ...prev, imageUrl: url }));
        }
        
        // Add all to images array
        setForm(prev => ({ ...prev, images: [...prev.images, url] }));
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
      toast({ title: "Images uploaded successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload images", variant: "destructive" });
    }
    setUploading(false);
    setUploadProgress(0);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setForm(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      // If we removed the cover image, set the next one
      const newImageUrl = index === 0 && newImages.length > 0 ? newImages[0] : prev.imageUrl;
      return { ...prev, images: newImages, imageUrl: newImageUrl };
    });
  };

  const handleSave = async () => {
    if (!form.title) return;
    const payload = { 
      ...form, 
      date: form.date || new Date().toISOString().split("T")[0],
      video_url: form.videoUrl // Include for backwards compatibility
    };
    try {
      if (editing) {
        await updateNews(editing._id, payload as any);
        toast({ title: "News updated" });
      } else {
        await createNews(payload as any);
        toast({ title: "News published" });
      }
      setDialogOpen(false);
      fetchNews();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNews(id);
      toast({ title: "News deleted" });
      fetchNews();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete", variant: "destructive" });
    }
  };

  if (loading) return <AdminLayout><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">Manage News</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add News</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">{editing ? "Edit News" : "Post News"}</DialogTitle>
                <DialogDescription className="sr-only">Form to create or edit a news article</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                <Textarea placeholder="Excerpt" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Academic", "Research", "Campus", "International", "Alumni"].map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Cover Image</label>
                  {form.imageUrl && (
                    <div className="relative w-full h-32 rounded-md overflow-hidden border border-border mb-2">
                      <img src={form.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setForm({ ...form, imageUrl: "" })}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <label className="w-full h-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary transition-colors">
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">
                      {uploading ? `Uploading ${uploadProgress}%...` : "Upload cover image"}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageFiles}
                      disabled={uploading}
                    />
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Cover image alt text (describe the image for accessibility)"
                    value={form.imageAlt}
                    onChange={e => setForm({ ...form, imageAlt: e.target.value })}
                    maxLength={125}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Additional Photos</label>
                  <div className="flex flex-wrap gap-2">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border border-border">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Video URL</label>
                  <Input 
                    type="url" 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    value={form.videoUrl} 
                    onChange={e => setForm({ ...form, videoUrl: e.target.value })} 
                  />
                  <small className="text-muted-foreground">Paste YouTube, Vimeo, or direct MP4 link</small>
                </div>
                <Button className="w-full bg-primary text-primary-foreground" onClick={handleSave} disabled={uploading}>{editing ? "Update" : "Publish"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {news.length === 0 && <p className="text-center text-muted-foreground py-8">No news yet. Add your first news article above.</p>}

        <div className="space-y-3">
          {news.map(item => (
            <Card key={item._id} className="border border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {item.images?.length > 0 ? (
                    <img src={item.images[0]} alt="" className="h-12 w-12 rounded-md object-cover" />
                  ) : (
                    <Newspaper className="h-8 w-8 text-secondary" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      {item.priority === "high" && <span className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded">High</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.category} • {item.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item._id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNews;
