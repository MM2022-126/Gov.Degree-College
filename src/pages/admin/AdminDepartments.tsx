import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { getDepartments, getPrograms, createDepartment, updateDepartment, deleteDepartment, createProgram, updateProgram, deleteProgram } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const ICONS = ["📚", "💻", "📊", "⚙️", "🏥", "🎨", "🔬", "🌍", "⚖️", "🧮", "📐", "🧪"];
const LEVELS = ["Intermediate", "ADP/ADS", "BS (4-Year)", "Postgraduate"];

interface Department {
  _id: string;
  name: string;
  icon: string;
  description: string;
  display_order: number;
}

interface Program {
  _id: string;
  department_id: string;
  name: string;
  level: string;
  duration: string;
  description?: string;
}

const AdminDepartments = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [progDialogOpen, setProgDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingProg, setEditingProg] = useState<Program | null>(null);
  const [deptForm, setDeptForm] = useState({ name: "", icon: "📚", description: "", display_order: 0 });
  const [progForm, setProgForm] = useState({ department_id: "", name: "", level: "Intermediate", duration: "", description: "" });

  const fetchData = async () => {
    try {
      const [depts, progs] = await Promise.all([
        getDepartments(),
        getPrograms(),
      ]);
      if (depts) setDepartments(depts);
      if (progs) setPrograms(progs);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
    }
  };

  useEffect(() => { fetchData(); }, []);

  const saveDepartment = async () => {
    if (!deptForm.name.trim()) return;
    try {
      if (editingDept) {
        await updateDepartment(editingDept._id, deptForm);
      } else {
        await createDepartment(deptForm);
      }
      toast({ title: editingDept ? "Department updated" : "Department added" });
      setDeptDialogOpen(false);
      setEditingDept(null);
      setDeptForm({ name: "", icon: "📚", description: "", display_order: 0 });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save", variant: "destructive" });
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await deleteDepartment(id);
      toast({ title: "Department deleted" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete", variant: "destructive" });
    }
  };

  const saveProgram = async () => {
    if (!progForm.name.trim() || !progForm.department_id) return;
    try {
      if (editingProg) {
        await updateProgram(editingProg._id, progForm);
      } else {
        await createProgram(progForm);
      }
      toast({ title: editingProg ? "Program updated" : "Program added" });
      setProgDialogOpen(false);
      setEditingProg(null);
      setProgForm({ department_id: "", name: "", level: "Intermediate", duration: "", description: "" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save", variant: "destructive" });
    }
  };

  const handleDeleteProgram = async (id: string) => {
    try {
      await deleteProgram(id);
      toast({ title: "Program deleted" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete", variant: "destructive" });
    }
  };

  const openEditDept = (d: Department) => {
    setEditingDept(d);
    setDeptForm({ name: d.name, icon: d.icon, description: d.description || "", display_order: d.display_order });
    setDeptDialogOpen(true);
  };

  const openEditProg = (p: Program) => {
    setEditingProg(p);
    setProgForm({ department_id: p.department_id, name: p.name, level: p.level, duration: p.duration || "", description: p.description || "" });
    setProgDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Departments Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Departments</h2>
            <Dialog open={deptDialogOpen} onOpenChange={(o) => { setDeptDialogOpen(o); if (!o) { setEditingDept(null); setDeptForm({ name: "", icon: "📚", description: "", display_order: 0 }); } }}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Department</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingDept ? "Edit" : "Add"} Department</DialogTitle></DialogHeader>
                <DialogDescription className="sr-only">{editingDept ? "Edit department details" : "Add a new department"}</DialogDescription>
                <div className="space-y-4">
                  <div><Label>Name</Label><Input value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} /></div>
                  <div>
                    <Label>Icon</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {ICONS.map(icon => (
                        <button key={icon} onClick={() => setDeptForm({ ...deptForm, icon })} className={`text-2xl p-1 rounded border ${deptForm.icon === icon ? "border-primary bg-accent" : "border-transparent"}`}>{icon}</button>
                      ))}
                    </div>
                  </div>
                  <div><Label>Description</Label><Textarea value={deptForm.description} onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} /></div>
                  <div><Label>Display Order</Label><Input type="number" value={deptForm.display_order} onChange={e => setDeptForm({ ...deptForm, display_order: parseInt(e.target.value) || 0 })} /></div>
                  <Button onClick={saveDepartment} className="w-full">{editingDept ? "Update" : "Add"} Department</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {departments.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No departments added yet. Click "Add Department" to get started.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map(dept => (
                <Card key={dept._id}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <span className="text-3xl">{dept.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground">{dept.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{dept.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {programs.filter(p => p.department_id === dept._id).length > 0 
                          ? `${programs.filter(p => p.department_id === dept._id).length} programs` 
                          : "Programs coming soon"}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEditDept(dept)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDepartment(dept._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Programs Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Programs</h2>
            <Dialog open={progDialogOpen} onOpenChange={(o) => { setProgDialogOpen(o); if (!o) { setEditingProg(null); setProgForm({ department_id: "", name: "", level: "Intermediate", duration: "", description: "" }); } }}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Program</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingProg ? "Edit" : "Add"} Program</DialogTitle></DialogHeader>
                <DialogDescription className="sr-only">{editingProg ? "Edit program details" : "Add a new program to a department"}</DialogDescription>
                <div className="space-y-4">
                  <div>
                    <Label>Department</Label>
                    <Select value={progForm.department_id} onValueChange={v => setProgForm({ ...progForm, department_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map(d => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Program Name</Label><Input value={progForm.name} onChange={e => setProgForm({ ...progForm, name: e.target.value })} /></div>
                  <div>
                    <Label>Level</Label>
                    <Select value={progForm.level} onValueChange={v => setProgForm({ ...progForm, level: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Duration</Label><Input value={progForm.duration} onChange={e => setProgForm({ ...progForm, duration: e.target.value })} placeholder="e.g. 2 Years, 4 Years" /></div>
                  <div><Label>Description</Label><Textarea value={progForm.description} onChange={e => setProgForm({ ...progForm, description: e.target.value })} /></div>
                  <Button onClick={saveProgram} className="w-full">{editingProg ? "Update" : "Add"} Program</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {programs.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No programs added yet. Add departments first, then add programs.</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {departments.map(dept => {
                const deptProgs = programs.filter(p => p.department_id === dept._id);
                if (deptProgs.length === 0) return null;
                return (
                  <Card key={dept._id}>
                    <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><span>{dept.icon}</span>{dept.name}</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {deptProgs.map(prog => (
                        <div key={prog.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-md">
                          <div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-primary" />
                              <span className="font-medium text-foreground">{prog.name}</span>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{prog.level}</span>
                            </div>
                            {prog.duration && <p className="text-xs text-muted-foreground ml-6">{prog.duration}</p>}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditProg(prog)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProgram(prog._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDepartments;
