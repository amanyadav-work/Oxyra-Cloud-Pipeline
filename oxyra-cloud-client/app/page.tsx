
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Hero from "@/components/home/hero";
import Items from "@/components/home/items";
import Logos from "@/components/home/logos";
import { LayoutLines } from "@/components/ui/layout-lines";

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-background text-foreground min-h-screen w-full">
        <LayoutLines />
        {/* <Navbar /> */}
        <Hero />
        <Logos />
        <Items />
        {/* 
        <Pricing />
        <FAQ />
        <CTA />
        <Footer /> */}
      </main>
      <Footer />
    </>
  );
}