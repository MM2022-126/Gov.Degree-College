import { useState, useEffect } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { getSchedule } from "@/lib/api";

interface ScheduleItem {
  _id: string;
  subject: string;
  date: string;
  time: string;
  venue: string;
}

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchedule()
      .then((data) => {
        setScheduleData((data as any[]) || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch schedule:", error);
        setLoading(false);
      });
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
        title="Academic Schedule"
        description="Exam schedules, timetables, and academic calendar for Government Graduate College, Ravi Road, Shahdara, Lahore."
        path="/schedule"
        keywords="GGC exam schedule, timetable Lahore, academic calendar, examination dates Shahdara"
      />
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Academic Schedule</h1>
          <p className="text-primary-foreground/80 text-lg">Exam schedules, timetables, and academic notices</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="section-heading">Exam Schedule</h2>
          {scheduleData.length > 0 ? (
            <Card className="border border-border mb-12">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-accent">
                      <tr>
                        <th className="text-left p-4 font-semibold text-foreground">Subject</th>
                        <th className="text-left p-4 font-semibold text-foreground">Date</th>
                        <th className="text-left p-4 font-semibold text-foreground">Time</th>
                        <th className="text-left p-4 font-semibold text-foreground">Venue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleData.map((exam) => (
                        <tr key={exam._id} className="border-t border-border">
                          <td className="p-4 text-foreground font-medium">{exam.subject}</td>
                          <td className="p-4 text-muted-foreground">{exam.date}</td>
                          <td className="p-4 text-muted-foreground">{exam.time}</td>
                          <td className="p-4 text-muted-foreground">{exam.venue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border mb-12">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No schedule items available at the moment.</p>
              </CardContent>
            </Card>
          )}

          <h2 className="section-heading">Downloadable Notices</h2>
          <div className="space-y-3">
            <Card className="border border-border">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-center">Notice management coming soon</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Schedule;
