import { useState, useRef, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Image, Trash2, Edit2, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaItem {
  _id: string;
  url: string;
  publicId: string;
  altText: string;
  caption: string;
  category: string;
  tags: string[];
  uploadedAt: string;
}

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'campus', label: 'Campus' },
  { value: 'events', label: 'Events' },
  { value: 'sports', label: 'Sports' },
  { value: 'academics', label: 'Academics' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'students', label: 'Students' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'achievements', label: 'Achievements' },
  { value: 'other', label: 'Other' },
];

const AdminMedia = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);

  // Media list state
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch media list
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/media', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch media');
      const data = await res.json();
      setMediaList(Array.isArray(data) ? data : []);
      
      // Filter by selected category
      if (selectedCategory === 'all') {
        setFilteredMedia(Array.isArray(data) ? data : []);
      } else {
        setFilteredMedia(
          (Array.isArray(data) ? data : []).filter((m: MediaItem) => m.category === selectedCategory)
        );
      }
    } catch (err) {
      console.error('Error fetching media:', err);
      toast({ title: 'Error', description: 'Failed to load media', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, toast]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Only image files allowed', variant: 'destructive' });
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({ title: 'Error', description: 'File size must be less than 10MB', variant: 'destructive' });
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleUpload = async () => {
    if (!file || !altText.trim() || !category) {
      toast({ title: 'Error', description: 'Image, alt text and category are all required', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      // Step 1: Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!uploadRes.ok) throw new Error('Cloudinary upload failed');
      const { url, publicId } = await uploadRes.json();

      // Step 2: Save metadata to MongoDB
      const mediaRes = await fetch('http://localhost:3000/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          url,
          publicId,
          altText: altText.trim(),
          caption: caption.trim(),
          category,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });

      if (!mediaRes.ok) throw new Error('Failed to save media record');

      toast({ title: 'Success', description: 'Image uploaded successfully' });
      
      // Reset form
      setFile(null);
      setPreview('');
      setAltText('');
      setCaption('');
      setCategory('');
      setTags('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Refresh media list
      fetchMedia();
    } catch (err) {
      console.error('Upload error:', err);
      toast({ title: 'Error', description: 'Upload failed. Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, publicId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const res = await fetch(`http://localhost:3000/api/media/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to delete media');

      toast({ title: 'Success', description: 'Image deleted successfully' });
      fetchMedia();
    } catch (err) {
      console.error('Delete error:', err);
      toast({ title: 'Error', description: 'Failed to delete image', variant: 'destructive' });
    }
  };

  const handleCategoryFilter = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'all') {
      setFilteredMedia(mediaList);
    } else {
      setFilteredMedia(mediaList.filter(m => m.category === cat));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Media Manager</h1>
          <p className="text-muted-foreground mt-1">Upload and organize media assets</p>
        </div>

        {/* UPLOAD FORM */}
        <Card className="border border-border">
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4">Upload New Image</h2>
            
            {/* Drag and Drop Zone */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors mb-6"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {preview ? (
                <div>
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  <p className="text-sm text-gray-500 mt-3">Click to replace image</p>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Click to select or drag & drop an image</p>
                  <p className="text-gray-400 text-sm mt-1">JPG, PNG, WebP — max 10MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Alt Text */}
              <div>
                <label className="block font-medium mb-1">
                  Alt Text <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal text-sm ml-2">
                    (Describe for accessibility & SEO)
                  </span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Students at the annual science fair"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  maxLength={125}
                  className="w-full"
                />
                <p className="text-xs text-gray-400 mt-1">{altText.length}/125 characters</p>
              </div>

              {/* Category */}
              <div>
                <label className="block font-medium mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">-- Select a category --</option>
                  {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Caption */}
              <div>
                <label className="block font-medium mb-1">Caption (optional)</label>
                <Input
                  type="text"
                  placeholder="Short caption shown below the image"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-medium mb-1">Tags (optional, comma separated)</label>
                <Input
                  type="text"
                  placeholder="e.g. 2024, science, lab, students"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={uploading || !file || !altText || !category}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* CATEGORY FILTER TABS */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              onClick={() => handleCategoryFilter(cat.value)}
              className="whitespace-nowrap"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* MEDIA GRID */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-500 mt-2">Loading media...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Image className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No media in this category yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedia.map(item => (
              <MediaCard key={item._id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const MediaCard = ({ item, onDelete }: { item: MediaItem; onDelete: (id: string, publicId: string) => void }) => (
  <div className="relative group rounded-xl overflow-hidden border bg-white hover:shadow-lg transition-shadow">
    <div className="aspect-square overflow-hidden">
      <img
        src={item.url}
        alt={item.altText}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        loading="lazy"
      />
    </div>
    <div className="p-2">
      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
        {item.category}
      </span>
      {item.caption && (
        <p className="text-xs text-gray-500 mt-1 truncate">{item.caption}</p>
      )}
      <p className="text-xs text-gray-400 mt-0.5 truncate" title={item.altText}>
        Alt: {item.altText}
      </p>
    </div>
    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onDelete(item._id, item.publicId)}
        className="bg-white rounded-full p-1.5 shadow text-red-500 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  </div>
);

export default AdminMedia;

