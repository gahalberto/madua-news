import { Metadata } from "next";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: {
    default: "Blog | Clube do Rabino",
    template: "%s | Blog do Clube do Rabino",
  },
  description: "Artigos, tutoriais e insights sobre programação, design, marketing digital e muito mais.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
} 