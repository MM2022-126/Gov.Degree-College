import PublicLayout from "@/components/layout/PublicLayout";
import PageSEO from "@/components/PageSEO";
import { Users, Award, BookOpen, Target } from "lucide-react";
import administrationBlock from "@/assets/administration-block.jpeg";
import mosquePic2 from "@/assets/mosque-pic2.jpeg";

const About = () => {
  return (
    <PublicLayout>
      <PageSEO
        title="About Us"
        description="Learn about Government Graduate College, Ravi Road, Shahdara, Lahore — a premier government institution established in 1970 offering quality higher education in Punjab, Pakistan."
        path="/about"
        keywords="about GGC Lahore, government college history, Shahdara college, established 1970, Punjab education"
      />
      {/* Hero with image */}
      <section className="relative bg-primary py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={administrationBlock} alt="Administration Block of Government Graduate College Shahdara" loading="eager" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Government Graduate College</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Ravi Road, Shahdara, Lahore — A legacy of academic excellence since 1970
          </p>
        </div>
      </section>

      {/* History with campus image */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="section-heading text-center">Our History</h2>
          <p className="section-subheading text-center">Over five decades of educational leadership</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-8">
            <div className="prose prose-lg text-muted-foreground space-y-4">
              <p>
                Established on January 5, 1970, Government Graduate College Ravi Road, Shahdara, Lahore has grown into a prominent public sector institution committed to the promotion of quality education and intellectual development in the region. The college initially operated in rented premises at Timber Market Ravi Road and later in Farrukhabad Shahdara before shifting to its permanent campus in 1987.
              </p>
              <p>
                Over the decades, the institution has undergone significant academic expansion: it was upgraded from an Intermediate College to a Degree College in 1989, elevated to Postgraduate status in 2018, and with the launch of the BS (4-Year Degree Program) in 2020, it assumed its present status as a Government Graduate College.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img src={mosquePic2} alt="Masjid Rehmat-ul-Alameen at Government Graduate College campus" loading="lazy" className="w-full h-full object-cover aspect-[4/3]" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Target,
                title: "Our Mission",
                text: "To promote quality education and intellectual development, creating an environment where students can develop comprehensive knowledge and skills across diverse disciplines.",
              },
              {
                icon: Award,
                title: "Our Facilities",
                text: "Spread over 22 kanals, our campus includes undergraduate and faculty blocks, 30+ classrooms, 10 laboratories, a library with 18,000+ books, the Ravi Auditorium (300+ capacity), and a mosque for spiritual development.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-background rounded-lg p-8 border border-border card-hover">
                <item.icon className="h-10 w-10 text-secondary mb-4" />
                <h3 className="font-display text-2xl font-bold text-primary mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-background" id="administration">
        <div className="container mx-auto px-4">
          <h2 className="section-heading text-center">Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mt-8">
            {[
              { icon: BookOpen, title: "Academic Excellence", desc: "Comprehensive quality education across humanities, social sciences, natural sciences, commerce, and computer science" },
              { icon: Users, title: "Community Engagement", desc: "Contributing to the intellectual and social growth of Shahdara and surrounding areas" },
              { icon: Award, title: "Institutional Growth", desc: "Continuous expansion from Intermediate College to Graduate status with modern facilities" },
              { icon: Target, title: "Student Development", desc: "Supporting both academic achievement and co-curricular development for holistic growth" },
            ].map((v, i) => (
              <div key={i} className="text-center p-6 rounded-lg bg-accent/50">
                <v.icon className="h-8 w-8 mx-auto mb-3 text-secondary" />
                <h3 className="font-display font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default About;
