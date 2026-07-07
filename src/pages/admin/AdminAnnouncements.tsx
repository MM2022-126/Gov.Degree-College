import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Bell, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  active: boolean;
}

const AdminAnnouncements = () => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const data = await getAnnouncements();
      setItems((data as any[]) || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch announcements", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openNew = () => { setEditing(null); setForm({ title: "", content: "" }); setDialogOpen(true); };
  const openEdit = (a: Announcement) => { setEditing(a); setForm({ title: a.title, content: a.content || "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.title) return;
    try {
      if (editing) {
        await updateAnnouncement(editing._id, { ...form, active: editing.active });
        toast({ title: "Announcement updated" });
      } else {
        await createAnnouncement({ ...form, active: true });
        toast({ title: "Announcement created" });
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      toast({ title: "Announcement deleted" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete", variant: "destructive" });
    }
  };

  const toggleActive = async (a: Announcement) => {
    try {
      await updateAnnouncement(a._id, { title: a.title, content: a.content, active: !a.active });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to toggle", variant: "destructive" });
    }
  };

  if (loading) return <AdminLayout><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">Manage Announcements</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> New Announcement</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">{editing ? "Edit" : "Create"} Announcement</DialogTitle>
                <DialogDescription className="sr-only">Form to create or edit an announcement</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                <Textarea placeholder="Content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
                <Button className="w-full bg-primary text-primary-foreground" onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {items.length === 0 && <p className="text-center text-muted-foreground py-8">No announcements yet.</p>}

        <div className="space-y-3">
          {items.map(a => (
            <Card key={a._id} className="border border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Bell className="h-8 w-8 text-secondary" />
                  <div>
                    <h3 className="font-semibold text-foreground">{a.title}</h3>
                    <p className="text-sm text-muted-foreground">{a.active ? "Active" : "Inactive"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleActive(a)} title={a.active ? "Deactivate" : "Activate"}>
                    {a.active ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(a)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(a._id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
