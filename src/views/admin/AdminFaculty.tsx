'use client'

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Upload, X, GraduationCap, Crown, Loader2 } from "lucide-react";
import { getFaculty, createFaculty, updateFaculty, deleteFaculty, getPrincipals, createPrincipal, updatePrincipal, deletePrincipal } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface FacultyMember {
  _id?: string;
  id?: string;
  name: string;
  title: string;
  dept: string;
  email: string;
  specialization: string;
  image: string;
}

interface Principal {
  _id?: string;
  id?: string;
  name: string;
  tenure: string;
  image: string;
  description: string;
  role?: "principal" | "vice-principal" | "director";
}

const initialPrincipals: Principal[] = [];

const AdminFaculty = () => {
  const { toast } = useToast();
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [principalDialogOpen, setPrincipalDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);
  const [editingPrincipal, setEditingPrincipal] = useState<Principal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingPrincipals, setLoadingPrincipals] = useState(true);
  const [savingPrincipal, setSavingPrincipal] = useState(false);

  const [form, setForm] = useState({ name: "", title: "", dept: "", email: "", specialization: "", image: "", imageAlt: "" });
  const [principalForm, setPrincipalForm] = useState({ name: "", tenure: "", image: "", imageAlt: "", description: "", role: "principal" as const });

  // Fetch faculty on component mount
  useEffect(() => {
    const loadFaculty = async () => {
      try {
        setLoading(true);
        const data = await getFaculty();
        setFaculty(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load faculty:", error);
        toast({ title: "Error", description: "Failed to load faculty members", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    loadFaculty();
  }, [toast]);

  // Fetch principals on component mount
  useEffect(() => {
    const loadPrincipals = async () => {
      try {
        setLoadingPrincipals(true);
        const data = await getPrincipals();
        setPrincipals(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load principals:", error);
        toast({ title: "Error", description: "Failed to load principals", variant: "destructive" });
      } finally {
        setLoadingPrincipals(false);
      }
    };

    loadPrincipals();
  }, [toast]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "faculty" | "principal") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (target === "faculty") setForm(prev => ({ ...prev, image: result }));
      else setPrincipalForm(prev => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const saveFaculty = async () => {
    if (!form.name || !form.title) {
      toast({ title: "Error", description: "Name and title are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (editingFaculty) {
        const facultyId = editingFaculty._id || editingFaculty.id;
        await updateFaculty(facultyId || "", form);
        setFaculty(prev => prev.map(f => {
          const fId = f._id || f.id;
          const eId = editingFaculty._id || editingFaculty.id;
          return fId === eId ? { ...editingFaculty, ...form } : f;
        }));
        toast({ title: "Success", description: "Faculty member updated" });
      } else {
        const newFaculty = await createFaculty(form);
        setFaculty(prev => [...prev, newFaculty]);
        toast({ title: "Success", description: "Faculty member added" });
      }
      setForm({ name: "", title: "", dept: "", email: "", specialization: "", image: "" });
      setEditingFaculty(null);
      setDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save faculty", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const savePrincipal = async () => {
    if (!principalForm.name || !principalForm.tenure) {
      toast({ title: "Error", description: "Name and tenure are required", variant: "destructive" });
      return;
    }

    setSavingPrincipal(true);
    try {
      if (editingPrincipal) {
        const principalId = editingPrincipal._id || editingPrincipal.id;
        await updatePrincipal(principalId || "", principalForm);
        setPrincipals(prev => prev.map(p => {
          const pId = p._id || p.id;
          const eId = editingPrincipal._id || editingPrincipal.id;
          return pId === eId ? { ...editingPrincipal, ...principalForm } : p;
        }));
        toast({ title: "Success", description: "Principal updated" });
      } else {
        const newPrincipal = await createPrincipal(principalForm);
        setPrincipals(prev => [...prev, newPrincipal]);
        toast({ title: "Success", description: "Principal added" });
      }
      setPrincipalForm({ name: "", tenure: "", image: "", description: "", role: "principal" });
      setEditingPrincipal(null);
      setPrincipalDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save principal", variant: "destructive" });
    } finally {
      setSavingPrincipal(false);
    }
  };

  const openEditFaculty = (f: FacultyMember) => {
    setEditingFaculty(f);
    setForm({ name: f.name, title: f.title, dept: f.dept, email: f.email, specialization: f.specialization, image: f.image, imageAlt: (f as any).imageAlt || "" });
    setDialogOpen(true);
  };

  const openEditPrincipal = (p: Principal) => {
    setEditingPrincipal(p);
    setPrincipalForm({ name: p.name, tenure: p.tenure, image: p.image, imageAlt: (p as any).imageAlt || "", description: p.description, role: p.role || "principal" });
    setPrincipalDialogOpen(true);
  };

  const handleDeleteFaculty = async (f: FacultyMember) => {
    const facultyId = f._id || f.id;
    if (!facultyId) return;

    try {
      await deleteFaculty(facultyId);
      setFaculty(prev => prev.filter(x => {
        const xId = x._id || x.id;
        return xId !== facultyId;
      }));
      toast({ title: "Success", description: "Faculty member deleted" });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete faculty", variant: "destructive" });
    }
  };

  const handleDeletePrincipal = async (p: Principal) => {
    const principalId = p._id || p.id;
    if (!principalId) return;

    try {
      await deletePrincipal(principalId);
      setPrincipals(prev => prev.filter(x => {
        const xId = x._id || x.id;
        return xId !== principalId;
      }));
      toast({ title: "Success", description: "Principal deleted" });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete principal", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Faculty & Principals</h1>

        <Tabs defaultValue="faculty">
          <TabsList>
            <TabsTrigger value="faculty" className="gap-2"><GraduationCap className="h-4 w-4" /> Faculty Members</TabsTrigger>
            <TabsTrigger value="principals" className="gap-2"><Crown className="h-4 w-4" /> Principals</TabsTrigger>
          </TabsList>

          {/* Faculty Tab */}
          <TabsContent value="faculty" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingFaculty(null); setForm({ name: "", title: "", dept: "", email: "", specialization: "", image: "", imageAlt: "" }); } }}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add Faculty</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingFaculty ? "Edit" : "Add"} Faculty Member</DialogTitle>
                    <DialogDescription className="sr-only">Form to add or edit faculty member information</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    {/* Image upload */}
                    <div className="flex flex-col items-center gap-2">
                      {form.image ? (
                        <div className="relative w-24 h-24">
                          <img src={form.image} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-border" />
                          <button onClick={() => setForm(p => ({ ...p, image: "" }))} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"><X className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <label className="w-24 h-24 rounded-full bg-muted flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-border hover:border-primary transition-colors">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground mt-1">Photo</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "faculty")} />
                        </label>
                      )}
                    </div>
                    <Input placeholder="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                    <Input placeholder="Title (e.g. Professor)" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                    <Input placeholder="Department" value={form.dept} onChange={e => setForm(p => ({ ...p, dept: e.target.value }))} />
                    <Input placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                    <Input placeholder="Specialization" value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} />
                    <Input placeholder="Photo alt text (describe this person for accessibility)" maxLength={125} value={form.imageAlt} onChange={e => setForm(p => ({ ...p, imageAlt: e.target.value }))} className="text-sm" />
                    <Button onClick={saveFaculty} className="w-full bg-primary text-primary-foreground" disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingFaculty ? "Update" : "Add"} Faculty
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : faculty.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No faculty members added yet. Click "Add Faculty" to get started.</CardContent></Card>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {faculty.map(f => {
                const fId = f._id || f.id || "";
                return (
                  <Card key={fId} className="border border-border group cursor-pointer" onClick={() => openEditFaculty(f)}>
                    <CardContent className="p-4 text-center">
                      {f.image ? (
                        <img src={f.image} alt={f.name} className="w-20 h-20 mx-auto mb-3 rounded-full object-cover border-2 border-accent" />
                      ) : (
                        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-accent flex items-center justify-center">
                          <span className="text-xl font-display font-bold text-primary">{f.name.split(" ").map(n => n[0]).join("")}</span>
                        </div>
                      )}
                      <h3 className="font-display font-semibold text-foreground text-sm">{f.name}</h3>
                      <p className="text-xs text-secondary font-medium">{f.title}</p>
                      <p className="text-xs text-muted-foreground">{f.dept}</p>
                      <div className="mt-2 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" className="text-destructive h-7 text-xs" onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFaculty(f);
                        }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            )}
          </TabsContent>

          {/* Principals Tab */}
          <TabsContent value="principals" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Dialog open={principalDialogOpen} onOpenChange={(o) => { setPrincipalDialogOpen(o); if (!o) { setEditingPrincipal(null); setPrincipalForm({ name: "", tenure: "", image: "", imageAlt: "", description: "" }); } }}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add Principal</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingPrincipal ? "Edit" : "Add"} Principal</DialogTitle>
                    <DialogDescription className="sr-only">Form to add or edit principal information</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="flex flex-col items-center gap-2">
                      {principalForm.image ? (
                        <div className="relative w-24 h-24">
                          <img src={principalForm.image} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-border" />
                          <button onClick={() => setPrincipalForm(p => ({ ...p, image: "" }))} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"><X className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <label className="w-24 h-24 rounded-full bg-muted flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-border hover:border-primary transition-colors">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground mt-1">Photo</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "principal")} />
                        </label>
                      )}
                    </div>
                    <Input placeholder="Principal Name" value={principalForm.name} onChange={e => setPrincipalForm(p => ({ ...p, name: e.target.value }))} />
                    <Input placeholder="Tenure (e.g. 2010 – Present)" value={principalForm.tenure} onChange={e => setPrincipalForm(p => ({ ...p, tenure: e.target.value }))} />
                    <Input placeholder="Photo alt text (describe this person for accessibility)" maxLength={125} value={principalForm.imageAlt} onChange={e => setPrincipalForm(p => ({ ...p, imageAlt: e.target.value }))} className="text-sm" />
                    <Input placeholder="Short Description" value={principalForm.description} onChange={e => setPrincipalForm(p => ({ ...p, description: e.target.value }))} />
                    <Button onClick={savePrincipal} className="w-full bg-primary text-primary-foreground" disabled={savingPrincipal}>
                      {savingPrincipal && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingPrincipal ? "Update" : "Add"} Principal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {loadingPrincipals ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : principals.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground">No principals added yet. Click "Add Principal" to get started.</CardContent></Card>
              ) : (
                <>
                  {principals.map((p, i) => (
                    <Card key={p._id || p.id} className="border border-border group cursor-pointer" onClick={() => openEditPrincipal(p)}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="text-center min-w-[40px]">
                          <span className="text-xs font-bold text-primary bg-accent rounded-full w-8 h-8 flex items-center justify-center mx-auto">{i + 1}</span>
                        </div>
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-16 h-16 rounded-full object-cover border-2 border-accent flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                            <Crown className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-foreground">{p.name}</h3>
                          <p className="text-sm text-secondary font-medium">{p.tenure}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleDeletePrincipal(p); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminFaculty;
