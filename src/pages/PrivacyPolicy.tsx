import PublicLayout from "@/components/layout/PublicLayout";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <PublicLayout>
      <PageSEO
        title="Privacy Policy"
        description="Privacy policy for Government Graduate College Ravi Road Shahdara Lahore"
        path="/privacy-policy"
      />
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Privacy Policy
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
                  <h2 className="font-display text-2xl font-bold mb-4">1. Information We Collect</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We collect only the information you voluntarily provide through our contact/chatbot form,
                    including your name, email address, and message content. We do not collect any personal
                    information from general visitors browsing the website.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Information submitted through our contact form is used solely to respond to your inquiry.
                    Your details are reviewed only by the college administration and are never shared with
                    third parties, sold, or used for marketing purposes.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">3. Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    This website may use basic session cookies to ensure proper functionality. No tracking
                    cookies, advertising cookies, or third-party analytics cookies are used.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">4. Data Storage</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Messages submitted through the contact form are stored securely in our database and
                    accessible only to authorized college administrators. Data is retained only as long as
                    necessary to respond to your inquiry.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">5. Third-Party Services</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    This website is hosted on Vercel and uses MongoDB Atlas for data storage. Both services
                    maintain their own privacy and security standards. We do not integrate any advertising
                    networks or third-party tracking services.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">6. Children's Privacy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    This website is intended for students, parents, and the general public. We do not
                    knowingly collect personal information from children under the age of 13.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">7. Your Rights</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You may request deletion of any message you submitted by contacting us at the college's
                    official email. We will process such requests within 7 working days.
                  </p>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">8. Contact</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For any privacy-related concerns, contact: <strong>Government Graduate College Ravi Road,
                    Shahdara, Lahore</strong>. Phone: <strong>[college phone number]</strong>. Email: 
                    <strong> [college email]</strong>.
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

export default PrivacyPolicy;
