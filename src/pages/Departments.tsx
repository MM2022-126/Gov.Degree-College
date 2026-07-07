import { useState, useEffect } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, AlertCircle } from "lucide-react";
import { getDepartments } from "@/lib/api";

interface DepartmentProgram {
  name: string;
  duration?: string;
  seats?: number;
  description?: string;
}

interface Department {
  _id: string;
  name: string;
  icon: string;
  description: string;
  programs?: DepartmentProgram[];
}

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const depts = await getDepartments();
        if (depts) setDepartments(depts);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <PublicLayout>
      <PageSEO
        title="Departments & Programs"
        description="Explore academic departments and programs at Government Graduate College, Ravi Road, Shahdara, Lahore — FSc, ICS, I.Com, FA, ADP/ADS, and BS 4-Year degrees."
        path="/departments"
        keywords="GGC departments, FSc Lahore, ICS program, BS degree Shahdara, ADP programs, government college programs"
      />
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Departments & Programs</h1>
          <p className="text-primary-foreground/80 text-lg">Explore academic departments and programs at Govt. Graduate College Ravi Road, Shahdara</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : departments.length === 0 ? (
            <p className="text-center text-muted-foreground">No departments available yet.</p>
          ) : (
            <div className="space-y-8">
              {departments.map(dept => {
                const deptProgs = dept.programs ?? [];
                return (
                  <Card key={dept._id} className="border border-border overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <span className="text-5xl">{dept.icon}</span>
                        <div>
                          <h2 className="font-display text-2xl font-bold text-foreground">{dept.name}</h2>
                          {dept.description && <p className="text-muted-foreground mt-1">{dept.description}</p>}
                        </div>
                      </div>
                      {deptProgs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                          {deptProgs.map((prog, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg">
                              <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <div>
                                <p className="font-medium text-sm text-foreground">{prog.name}</p>
                                <div className="flex gap-2 mt-1">
                                  {prog.duration && <span className="text-xs text-muted-foreground">{prog.duration}</span>}
                                  {prog.seats && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{prog.seats} seats</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg mt-4 text-amber-800 dark:text-amber-300">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <p className="text-sm">Programs coming soon</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default Departments;
