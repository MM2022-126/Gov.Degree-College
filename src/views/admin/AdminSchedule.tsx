'use client'

import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, BookOpen, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getSchedule, createSchedule, updateSchedule, deleteSchedule } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ScheduleItem {
  _id?: string;
  id?: string;
  subject: string;
  date: string;
  time: string;
  venue: string;
}

const AdminSchedule = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", date: "", time: "", venue: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch schedule on component mount
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setLoading(true);
        const data = await getSchedule();
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load schedule:", error);
        toast({ title: "Error", description: "Failed to load schedule", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [toast]);

  const handleSave = async () => {
    if (!form.subject || !form.date || !form.time || !form.venue) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const newSchedule = await createSchedule(form);
      setItems([...items, newSchedule]);
      setDialogOpen(false);
      setForm({ subject: "", date: "", time: "", venue: "" });
      toast({ title: "Success", description: "Schedule entry added" });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save schedule", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: ScheduleItem) => {
    const itemId = item._id || item.id;
    if (!itemId) return;

    try {
      await deleteSchedule(itemId);
      setItems(items.filter(i => {
        const iId = i._id || i.id;
        return iId !== itemId;
      }));
      toast({ title: "Success", description: "Schedule entry deleted" });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete schedule", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">Manage Schedule</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add Entry</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Add Schedule Entry</DialogTitle>
                <DialogDescription className="sr-only">Form to add a new schedule entry</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                  <Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                </div>
                <Input placeholder="Venue" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} />
                <Button className="w-full bg-primary text-primary-foreground" onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border border-border">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No schedule entries yet. Click "Add Entry" to get started.</div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-accent">
                  <tr>
                    <th className="text-left p-4 font-semibold text-foreground">Subject</th>
                    <th className="text-left p-4 font-semibold text-foreground">Date</th>
                    <th className="text-left p-4 font-semibold text-foreground">Time</th>
                    <th className="text-left p-4 font-semibold text-foreground">Venue</th>
                    <th className="text-right p-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id || item.id} className="border-t border-border">
                      <td className="p-4 font-medium text-foreground">{item.subject}</td>
                      <td className="p-4 text-muted-foreground">{item.date}</td>
                      <td className="p-4 text-muted-foreground">{item.time}</td>
                      <td className="p-4 text-muted-foreground">{item.venue}</td>
                      <td className="p-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => handleDelete(item)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSchedule;
