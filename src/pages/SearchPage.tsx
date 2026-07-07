import { useState } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search as SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";

const searchableContent = [
  { title: "Computer Science Department", type: "Department", path: "/departments", desc: "Programs in AI, data science, cybersecurity" },
  { title: "Admissions — Fall 2026", type: "Admissions", path: "/admissions", desc: "Apply now for undergraduate and graduate programs" },
  { title: "Annual Sports Gala", type: "Event", path: "/events", desc: "Inter-departmental sports competition" },
  { title: "Research Grant Announcement", type: "News", path: "/news", desc: "$2M grant awarded to Science Department" },
  { title: "Dr. Ahmed Khan — AI Researcher", type: "Faculty", path: "/faculty", desc: "Head of Computer Science Department" },
  { title: "Academic Schedule Spring 2026", type: "Academic", path: "/schedule", desc: "Exam dates and timetables" },
  { title: "Campus Photo Gallery", type: "Gallery", path: "/gallery", desc: "Explore our campus in pictures" },
  { title: "Contact Information", type: "Contact", path: "/contact", desc: "Get in touch with our administration" },
];

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const results = query.length > 1
    ? searchableContent.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.desc.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <PublicLayout>
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Search</h1>
          <p className="text-primary-foreground/80 text-lg">Find what you're looking for</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="relative mb-8">
            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search departments, faculty, events, news..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              autoFocus
            />
          </div>
          {query.length > 1 && (
            <div className="space-y-3">
              {results.map((r, i) => (
                <Link to={r.path} key={i}>
                  <Card className="border border-border card-hover cursor-pointer">
                    <CardContent className="p-4">
                      <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">{r.type}</span>
                      <h3 className="font-display font-semibold text-foreground mt-1">{r.title}</h3>
                      <p className="text-sm text-muted-foreground">{r.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {results.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No results found for "{query}"</p>
              )}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default SearchPage;
