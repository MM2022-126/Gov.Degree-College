'use client'

import PublicLayout from "@/components/layout/PublicLayout";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Calendar, FileText, GraduationCap } from "lucide-react";

const Admissions = () => {
  return (
    <PublicLayout>
      <PageSEO
        title="Admissions"
        description="Apply for admissions at Government Graduate College, Ravi Road, Shahdara, Lahore — Intermediate, ADP/ADS, and BS 4-Year programs. Merit list, eligibility, and fee structure."
        path="/admissions"
        keywords="GGC admissions 2026, apply online, merit list, eligibility criteria, fee structure, Shahdara college admissions"
      />
      <section className="bg-primary py-16">
       <div className="container mx-auto px-4 text-center">
           <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Admissions</h1>
           <p className="text-primary-foreground/80 text-lg">Join Government Graduate College for quality education and excellence</p>
         </div>
      </section>

      {/* Steps */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="section-heading text-center">How to Apply</h2>
          <p className="section-subheading text-center">Follow these simple steps to begin your application</p>

          <div className="space-y-6 mt-8">
            {[
              { step: 1, title: "Check Eligibility", desc: "Review the eligibility criteria for your desired program." },
              { step: 2, title: "Submit Application", desc: "Fill out the online application form with required documents." },
              { step: 3, title: "Entrance Test", desc: "Appear for the entrance examination on the scheduled date." },
              { step: 4, title: "Merit List", desc: "Check the merit list published on our website." },
              { step: 5, title: "Fee Payment & Enrollment", desc: "Pay your fees and complete the enrollment process." },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground text-lg">{s.title}</h3>
                  <p className="text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="section-heading text-center">Programs Offered</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
             {[
               { level: "Intermediate", icon: GraduationCap, programs: ["FSc Pre-Engineering", "FSc Pre-Medical", "ICS (Computer Science)", "I.Com (Commerce)", "FA (Arts & Humanities)"] },
               { level: "ADP/ADS", icon: FileText, programs: ["Computer Science ADP", "Business Administration ADP", "Engineering ADS"] },
               { level: "BS (4-Year)", icon: Calendar, programs: ["BS Computer Science", "BS Business Administration", "BS Engineering", "BS Natural Sciences"] },
             ].map((p, i) => (
               <Card key={i} className="border border-border card-hover">
                 <CardContent className="p-6">
                   <p.icon className="h-8 w-8 text-secondary mb-3" />
                   <h3 className="font-display text-xl font-bold text-primary mb-4">{p.level}</h3>
                   <ul className="space-y-2">
                     {p.programs.map((prog) => (
                       <li key={prog} className="flex items-center gap-2 text-sm text-muted-foreground">
                         <CheckCircle className="h-4 w-4 text-secondary shrink-0" />
                         {prog}
                       </li>
                     ))}
                   </ul>
                 </CardContent>
               </Card>
             ))}
           </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary/10">
       <div className="container mx-auto px-4 text-center">
           <h2 className="section-heading">Ready to Apply?</h2>
           <p className="text-muted-foreground text-lg mb-6">Start your application today for Government Graduate College</p>
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8">
            Start Application <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Admissions;
