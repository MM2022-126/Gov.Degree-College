import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-display text-xl font-bold mb-4 text-secondary">
              Government Graduate College
            </h3>
            <p className="text-sm opacity-80 leading-relaxed mb-4">
              A premier government institution of higher education on Ravi Road, Shahdara, Lahore — 
              committed to academic excellence and holistic student development since 1970.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Youtube, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-secondary">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "About Us", path: "/about" },
                { label: "Departments", path: "/departments" },
                { label: "Admissions", path: "/admissions" },
                { label: "Faculty", path: "/faculty" },
                { label: "Academic Schedule", path: "/schedule" },
                { label: "Gallery", path: "/gallery" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="opacity-80 hover:opacity-100 hover:text-secondary transition-all">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-secondary">Community</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "News & Updates", path: "/news" },
                { label: "Events", path: "/events" },
                { label: "Contact Us", path: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="opacity-80 hover:opacity-100 hover:text-secondary transition-all">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact - Dynamic from site_settings */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-secondary">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-secondary" />
                <span className="opacity-80">{settings.contact_address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-secondary" />
                <span className="opacity-80">{settings.contact_phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-secondary" />
                <span className="opacity-80">{settings.contact_email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm opacity-60">
            © {new Date().getFullYear()} Government Graduate College, Shahdara, Lahore. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm opacity-60">
            <Link to="/privacy-policy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <Link to="/terms-of-use" className="hover:opacity-100 transition-opacity">Terms of Use</Link>
            <a href="#" className="hover:opacity-100 transition-opacity">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
