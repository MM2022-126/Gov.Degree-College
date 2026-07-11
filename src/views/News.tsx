'use client'

import { useState, useEffect } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { getNews } from "@/lib/api";

interface NewsItem {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  priority: string;
  date: string;
  imageUrl?: string;
  videoUrl?: string;
  images?: string[];
}

const News = () => {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getNews().then((data) => {
      setAllNews((data as any[]) || []);
      setLoading(false);
    }).catch((error) => {
      console.error('Failed to fetch news:', error);
      setLoading(false);
    });
  }, []);

  const filtered = allNews.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <PublicLayout>
      <PageSEO
        title="News & Updates"
        description="Latest news, announcements, merit lists, and updates from Government Graduate College, Ravi Road, Shahdara, Lahore."
        path="/news"
        keywords="GGC news, college announcements, merit list Lahore, examination results, government college updates"
      />
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">News & Updates</h1>
          <p className="text-primary-foreground/80 text-lg">Stay informed with the latest happenings</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <Input placeholder="Search news..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-8" />
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-4">
              {filtered.map((news) => (
                <Card key={news._id} className="card-hover border border-border overflow-hidden">
                  {news.imageUrl && news.imageUrl.trim() !== '' ? (
                    <img 
                      src={news.imageUrl} 
                      alt={news.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div>
                      {news.priority === "high" && (
                        <span className="inline-block bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-0.5 rounded mb-2">Important</span>
                      )}
                      <span className="inline-block bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded mb-2 ml-1">{news.category}</span>
                      <h3 className="font-display text-xl font-semibold text-foreground mb-1">{news.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{new Date(news.date).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" })}</p>
                      <p className="text-muted-foreground">{news.excerpt}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No news found.</p>}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default News;
