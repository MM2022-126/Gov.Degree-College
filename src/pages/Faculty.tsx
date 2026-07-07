import { useState, useEffect } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Crown, Loader2 } from "lucide-react";
import facultyBlock from "@/assets/faculty-block.jpeg";
import { getFaculty, getPrincipals } from "@/lib/api";

interface Faculty {
  _id: string;
  name: string;
  title: string;
  dept: string;
  email: string;
  specialization: string;
  image: string;
}

interface Principal {
  _id: string;
  name: string;
  tenure: string;
  image: string;
  description: string;
}

const Faculty = () => {
  const [facultyData, setFacultyData] = useState<Faculty[]>([]);
  const [principalsData, setPrincipalsData] = useState<Principal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [faculty, principals] = await Promise.all([
          getFaculty(),
          getPrincipals(),
        ]);
        setFacultyData((faculty as any[]) || []);
        setPrincipalsData((principals as any[]) || []);
      } catch (error) {
        console.error("Failed to load faculty/principals data:", error);
        // Fallback to empty arrays on error
        setFacultyData([]);
        setPrincipalsData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <PageSEO
        title="Faculty Members"
        description="Meet the qualified faculty of Government Graduate College, Ravi Road, Shahdara, Lahore — experienced professors and lecturers across all departments."
        path="/faculty"
        keywords="GGC faculty, professors Lahore, college teachers Shahdara, government college staff"
      />
      
      {/* Hero */}
      <section className="relative bg-primary py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={facultyBlock} alt="Faculty Room Block at Government Graduate College Shahdara" loading="eager" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Our Faculty</h1>
          <p className="text-primary-foreground/80 text-lg">Meet our distinguished faculty members and leadership</p>
        </div>
      </section>

      {/* Principals Timeline */}
      {principalsData.length > 0 && (
        <section className="py-16 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">Our Principals</h2>
              <p className="text-muted-foreground">A legacy of visionary leadership from past to present</p>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
              <div className="space-y-8 md:space-y-12">
                {principalsData.map((p, i) => (
                  <div key={p._id} className={`flex flex-col md:flex-row items-center gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                      <Card className="inline-block card-hover max-w-sm shadow-md hover:shadow-lg border border-border/50 bg-gradient-to-br from-background to-accent/10 transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex-1">
                              <h3 className="font-display text-xl font-bold text-foreground leading-tight">{p.name}</h3>
                              {(p as any).role && (
                                <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-1">{(p as any).role}</p>
                              )}
                            </div>
                          </div>
                          <div className="border-t border-border/30 pt-3 mb-3">
                            <p className="text-secondary font-semibold text-sm">{p.tenure}</p>
                          </div>
                          {p.description && (
                            <p className="text-muted-foreground text-sm leading-relaxed">{p.description}</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                    <div className="relative z-10 flex-shrink-0">
                      {p.image ? (
                        <div className="relative">
                          <img src={p.image} alt={p.name} className="w-28 h-28 rounded-full object-cover border-4 border-primary shadow-lg" />
                          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                        </div>
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-4 border-primary shadow-lg">
                          <Crown className="h-12 w-12 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 hidden md:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Faculty Members */}
      {facultyData.length > 0 ? (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">Faculty Members</h2>
              <p className="text-muted-foreground">Our expert educators shaping the next generation</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {facultyData.map((f) => (
                <Card key={f._id} className="card-hover border border-border text-center">
                  <CardContent className="p-6">
                    {f.image ? (
                      <img src={f.image} alt={f.name} className="w-24 h-24 mx-auto mb-4 rounded-full object-cover border-2 border-accent" />
                    ) : (
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-2xl font-display font-bold text-primary">
                          {f.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                    )}
                    <h3 className="font-display font-semibold text-foreground">{f.name}</h3>
                    <p className="text-sm text-secondary font-medium">{f.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{f.dept}</p>
                    <p className="text-xs text-muted-foreground">{f.specialization}</p>
                    <a href={`mailto:${f.email}`} className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:text-secondary transition-colors">
                      <Mail className="h-3 w-3" /> {f.email}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">No faculty members available at the moment.</p>
          </div>
        </section>
      )}
    </PublicLayout>
  );
};

export default Faculty;
