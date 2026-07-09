import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const ICONS = ["📚", "💻", "📊", "⚙️", "🏥", "🎨", "🔬", "🌍", "⚖️", "🧮", "📐", "🧪"];
const LEVELS = ["Intermediate", "ADP/ADS", "BS (4-Year)", "Postgraduate"];

interface Program {
  _id?: string;
  department_id?: string;
  name: string;
  level: string;
  duration: string;
  description?: string;
}

interface Department {
  _id: string;
  name: string;
  icon: string;
  description: string;
  display_order: number;
  programs?: Program[];
}

const AdminDepartments = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [progDialogOpen, setProgDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingProg, setEditingProg] = useState<Program | null>(null);
  const [deptForm, setDeptForm] = useState({ name: "", icon: "📚", description: "", display_order: 0 });
  const [progForm, setProgForm] = useState({ department_id: "", name: "", level: "Intermediate", duration: "", description: "" });

  const fetchData = useCallback(async () => {
    try {
      const depts = (await getDepartments()) as Department[];
      const normalized = depts.map((dept) => ({
        ...dept,
        programs: dept.programs?.map((prog) => ({
          ...prog,
          department_id: dept._id,
        })) ?? [],
      }));
      setDepartments(normalized);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
      const targetDept = departments.find((d) => d._id === progForm.department_id);
      if (!targetDept) {
        throw new Error("Selected department not found");
      }

      const existingPrograms = targetDept.programs ?? [];
      let updatedPrograms: Program[] = [];

      if (editingProg) {
        const updatedProgram = {
          _id: editingProg._id,
          department_id: progForm.department_id,
          name: progForm.name,
          level: progForm.level,
          duration: progForm.duration,
          description: progForm.description,
        };

        if (editingProg.department_id === progForm.department_id) {
          updatedPrograms = existingPrograms.map((program) =>
            program._id === editingProg._id ? updatedProgram : program
          );
          await updateDepartment(targetDept._id, { programs: updatedPrograms });
        } else {
          const originalDept = departments.find((d) => d._id === editingProg.department_id);
          if (!originalDept) {
            throw new Error("Original department not found");
          }

          const originalPrograms = originalDept.programs ?? [];
          const updatedOriginalPrograms = originalPrograms.filter((program) => program._id !== editingProg._id);

          await Promise.all([
            updateDepartment(originalDept._id, { programs: updatedOriginalPrograms }),
            updateDepartment(targetDept._id, { programs: [...existingPrograms, updatedProgram] }),
          ]);
        }

        toast({ title: "Program updated" });
      } else {
        const newProgram: Program = {
          department_id: progForm.department_id,
          name: progForm.name,
          level: progForm.level,
          duration: progForm.duration,
          description: progForm.description,
        };

        updatedPrograms = [...existingPrograms, newProgram];
        await updateDepartment(targetDept._id, { programs: updatedPrograms });
        toast({ title: "Program added" });
      }

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
      const department = departments.find((dept) => dept.programs?.some((prog) => prog._id === id));
      if (!department) {
        throw new Error("Program department not found");
      }

      const updatedPrograms = (department.programs ?? []).filter((prog) => prog._id !== id);
      await updateDepartment(department._id, { programs: updatedPrograms });
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
    const departmentId = p.department_id || departments.find((d) => d.programs?.some((prog) => prog._id === p._id))?._id || "";
    setEditingProg({ ...p, department_id: departmentId });
    setProgForm({ department_id: departmentId, name: p.name, level: p.level, duration: p.duration || "", description: p.description || "" });
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
                        {dept.programs && dept.programs.length > 0
                          ? `${dept.programs.length} programs`
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

          {departments.every((dept) => !dept.programs || dept.programs.length === 0) ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No programs added yet. Add departments first, then add programs.</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {departments.map((dept) => {
                const deptProgs = dept.programs ?? [];
                if (deptProgs.length === 0) return null;
                return (
                  <Card key={dept._id}>
                    <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><span>{dept.icon}</span>{dept.name}</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {deptProgs.map((prog, idx) => (
                        <div key={prog._id ?? idx} className="flex items-center justify-between p-3 bg-accent/50 rounded-md">
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
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProgram(prog._id ?? "")}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
