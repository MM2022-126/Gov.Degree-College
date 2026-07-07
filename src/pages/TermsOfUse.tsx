import PublicLayout from "@/components/layout/PublicLayout";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";

const TermsOfUse = () => {
  return (
    <PublicLayout>
      <PageSEO
        title="Terms of Use"
        description="Terms of use for Government Graduate College Ravi Road Shahdara Lahore"
        path="/terms-of-use"
      />
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Terms of Use
          </h1>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border border-border">
            <CardContent className="p-8 prose prose-invert max-w-none">
              <div className="space-y-8 text-foreground">
                <p className="text-sm text-muted-foreground">
                  <strong>Government Graduate College Ravi Road Shahdara Lahore</strong> <br />
                  Last updated: 2025
                </p>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing and using this website, you agree to be bound by these Terms of Use.
                    If you do not agree, please do not use this website.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">2. Purpose of This Website</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    This website is the official online presence of Government Graduate College Ravi Road,
                    Shahdara, Lahore, established 1970. It is intended to provide information about the
                    college's programs, faculty, events, admissions, and general institutional information.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">3. Permitted Use</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You may browse, read, and share content from this website for personal, educational,
                    or informational purposes. You may not reproduce, republish, or commercially exploit
                    any content without written permission from the college administration.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">4. Contact Form / Chatbot</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The contact/chatbot feature is provided for genuine inquiries only. Misuse including
                    spam, abusive language, or false information may result in your inquiry being ignored
                    and your access being restricted.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">5. Accuracy of Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We strive to keep all information accurate and up to date. However, the college reserves
                    the right to modify program details, fee structures, dates, and other information at any
                    time without notice. Always confirm critical information directly with the college office.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">6. Intellectual Property</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All content on this website including text, images, logos, and design belongs to
                    Government Graduate College Ravi Road Shahdara Lahore or its respective owners.
                    Unauthorized use is prohibited.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">7. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The college is not liable for any loss or damage arising from use of this website or
                    reliance on information provided herein.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">8. Governing Law</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    These terms are governed by the laws of Pakistan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
};

export default TermsOfUse;
