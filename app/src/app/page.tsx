import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <MenuSection />
      <HowItWorks />
      <Footer />
      <CartDrawer />
    </main>
  );
}
