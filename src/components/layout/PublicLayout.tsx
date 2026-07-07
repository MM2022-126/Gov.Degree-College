import Header from "./Header";
import Footer from "./Footer";
import LiveChatWidget from "@/components/LiveChatWidget";

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <LiveChatWidget />
    </div>
  );
};

export default PublicLayout;
