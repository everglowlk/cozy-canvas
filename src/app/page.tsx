import Nav from "@/components/public/Nav";
import Hero from "@/components/public/Hero";
import Experience from "@/components/public/Experience";
import Included from "@/components/public/Included";
import TicketBlock from "@/components/public/TicketBlock";
import FAQ from "@/components/public/FAQ";
import Footer from "@/components/public/Footer";

export default function LandingPage() {
  return (
    <main style={{ overflowX: "hidden" }}>
      <Nav />
      <Hero />
      <Experience />
      <Included />
      <TicketBlock />
      <FAQ />
      <Footer />
    </main>
  );
}
