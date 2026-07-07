import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Users, BookOpen, Trophy, Calendar, Newspaper, Bell, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PublicLayout from "@/components/layout/PublicLayout";
import PageSEO from "@/components/PageSEO";
import administrationBlock from "@/assets/administration-block.jpeg";
import undergraduateBlock from "@/assets/undergraduate-block.jpeg";
import postgraduateBlock from "@/assets/postgraduate-block.jpeg";
import { getNews, getEvents, getAnnouncements } from "@/lib/api";

const heroSlides = [
  {
    image: administrationBlock,
    title: "Government Graduate College",
    subtitle: "Promoting quality education and intellectual development since 1970",
    cta: "Explore Programs",
    link: "/departments",
  },
  {
    image: undergraduateBlock,
    title: "Allama Iqbal Undergraduate Block",
    subtitle: "Comprehensive programs from Intermediate to Bachelor's degrees with modern facilities",
    cta: "Learn More",
    link: "/about",
  },
  {
    image: postgraduateBlock,
    title: "Quaid-e-Azam Post Graduate Block",
    subtitle: "Advanced studies with dedicated labs and research facilities",
    cta: "View Programs",
    link: "/departments",
  },
];

const stats = [
  { icon: GraduationCap, value: "2,400+", label: "Students Enrolled" },
  { icon: Users, value: "100+", label: "Dedicated Faculty" },
  { icon: BookOpen, value: "18,000+", label: "Library Books" },
  { icon: Trophy, value: "54+", label: "Years of Excellence" },
];

const departments = [
  { name: "Pre-Engineering (FSc)", students: "Multiple Batches", icon: "⚙️" },
  { name: "Pre-Medical (FSc)", students: "Multiple Batches", icon: "🏥" },
  { name: "Computer Science (ICS)", students: "Multiple Batches", icon: "💻" },
  { name: "Commerce (I.Com)", students: "Multiple Batches", icon: "📊" },
  { name: "Arts & Humanities (FA)", students: "Multiple Batches", icon: "🎨" },
  { name: "BS (4-Year Degree)", students: "Multiple Programs", icon: "🎓" },
];

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [latestNews, setLatestNews] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [currentAlert, setCurrentAlert] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate alerts
  useEffect(() => {
    if (alerts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentAlert((prev) => (prev + 1) % alerts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [alerts.length]);

  useEffect(() => {
    getNews().then((data) => {
      setLatestNews(((data as any[]) || []).slice(0, 3));
    }).catch(console.error);
    
    getEvents().then((data) => {
      setUpcomingEvents(((data as any[]) || []).slice(0, 3));
    }).catch(console.error);
    
    getAnnouncements().then((data) => {
      setAlerts((data as any[]) || []);
    }).catch(console.error);
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return { month: d.toLocaleString("en", { month: "short" }).toUpperCase(), day: String(d.getDate()).padStart(2, "0"), full: d.toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" }) };
  };

  return (
    <PublicLayout>
      <PageSEO
        title="Government Graduate College Ravi Road Shahdara Lahore — Admissions, Programs & Results"
        description="Government Graduate College, Ravi Road, Shahdara, Lahore — established 1970. Offering Intermediate (FSc, ICS, I.Com, FA), ADP/ADS, and BS 4-Year degree programs. 2,400+ students, 100+ faculty."
        path="/"
        keywords="Government Graduate College, GGC Lahore, Shahdara college, admissions 2026, FSc Pre-Engineering, ICS, I.Com, BS degree Lahore"
      />
      {/* Hero Slider */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}>
            <img src={slide.image} alt={slide.title} loading={index === 0 ? "eager" : "lazy"} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "var(--gradient-hero-overlay)" }} />
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl animate-fade-in-up">
                  <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-4 leading-tight">{slide.title}</h1>
                  <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">{slide.subtitle}</p>
                  <Link to={slide.link}>
                    <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold text-base px-8">
                      {slide.cta}<ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? "bg-secondary w-8" : "bg-primary-foreground/40"}`} />
          ))}
        </div>
      </section>

      {/* Student Alerts Slider */}
      {alerts.length > 0 && (
        <section className="bg-secondary py-0 overflow-hidden">
          <div className="flex items-center">
            <div className="bg-primary px-4 py-3 shrink-0 flex items-center gap-2 z-10">
              <Bell className="h-4 w-4 text-primary-foreground" />
              <span className="text-primary-foreground text-sm font-semibold whitespace-nowrap">Student Alerts</span>
            </div>
            <div className="relative flex-1 h-[44px] overflow-hidden">
              {alerts.map((alert, i) => (
                <div
                  key={alert._id}
                  className={`absolute inset-0 flex items-center px-6 transition-all duration-500 ${
                    i === currentAlert
                      ? "opacity-100 translate-y-0"
                      : i === (currentAlert - 1 + alerts.length) % alerts.length
                      ? "opacity-0 -translate-y-full"
                      : "opacity-0 translate-y-full"
                  }`}
                >
                  {alert.type === "Emergency" && (
                    <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded mr-2 shrink-0">URGENT</span>
                  )}
                  <span className="text-secondary-foreground text-sm font-medium truncate">
                    {alert.title}{alert.message ? ` — ${alert.message}` : ""}
                  </span>
                </div>
              ))}
            </div>
            {alerts.length > 1 && (
              <div className="flex items-center gap-1.5 pr-4 shrink-0">
                <button
                  onClick={() => setCurrentAlert((prev) => (prev - 1 + alerts.length) % alerts.length)}
                  className="w-6 h-6 rounded-full bg-secondary-foreground/10 hover:bg-secondary-foreground/20 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-secondary-foreground" />
                </button>
                <span className="text-[10px] text-secondary-foreground/60 font-medium min-w-[28px] text-center">
                  {currentAlert + 1}/{alerts.length}
                </span>
                <button
                  onClick={() => setCurrentAlert((prev) => (prev + 1) % alerts.length)}
                  className="w-6 h-6 rounded-full bg-secondary-foreground/10 hover:bg-secondary-foreground/20 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-secondary-foreground" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-lg bg-accent/50">
                <stat.icon className="h-10 w-10 mx-auto mb-3 text-secondary" />
                <p className="text-3xl font-bold font-display text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-heading">Our Programs</h2>
            <p className="section-subheading">Quality education from Intermediate to Bachelor's degrees</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, i) => (
              <Link to="/departments" key={i}>
                <Card className="card-hover border border-border cursor-pointer group">
                  <CardContent className="p-6 flex items-center gap-4">
                    <span className="text-4xl">{dept.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{dept.name}</h3>
                      <p className="text-sm text-muted-foreground">{dept.students} Students</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* News & Events */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Latest News */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-heading mb-0"><Newspaper className="inline h-8 w-8 mr-2 text-secondary" />Latest News</h2>
                <Link to="/news" className="text-sm text-primary hover:text-secondary font-medium transition-colors">All News →</Link>
              </div>
              {latestNews.length === 0 ? (
                <p className="text-muted-foreground text-sm">No news published yet.</p>
              ) : (
                <div className="space-y-4">
                  {latestNews.map((news: any) => (
                    <Card key={news._id} className="card-hover border border-border">
                      <CardContent className="p-5">
                        {news.priority === "high" && (
                          <span className="inline-block bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-0.5 rounded mb-2">Important</span>
                        )}
                        <h3 className="font-display font-semibold text-foreground mb-1">{news.title}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{new Date(news.date).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" })}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{news.excerpt}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-heading mb-0"><Calendar className="inline h-8 w-8 mr-2 text-secondary" />Upcoming Events</h2>
                <Link to="/events" className="text-sm text-primary hover:text-secondary font-medium transition-colors">All Events →</Link>
              </div>
              {upcomingEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm">No upcoming events.</p>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event: any) => {
                    const d = formatDate(event.date);
                    return (
                      <Card key={event._id} className="card-hover border border-border">
                        <CardContent className="p-5 flex items-center gap-4">
                          <div className="bg-primary text-primary-foreground rounded-lg p-3 text-center min-w-[60px]">
                            <p className="text-xs font-semibold">{d.month}</p>
                            <p className="text-2xl font-bold font-display">{d.day}</p>
                          </div>
                          <div>
                            <h3 className="font-display font-semibold text-foreground">{event.title}</h3>
                            {event.venue && <p className="text-sm text-muted-foreground">{event.venue}</p>}
                            <p className="text-xs text-muted-foreground">{d.full}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={administrationBlock} alt="Government Graduate College campus view" loading="lazy" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Begin Your Journey with Us</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">Applications are now open for Fall 2026. Join our community of scholars and innovators.</p>
          <Link to="/admissions">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold text-base px-8">
              Apply Now<ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
