import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ProductPreview from "@/components/ProductPreview";
import Mission from "@/components/Mission";
import WhyBlitz from "@/components/WhyBlitz";
import PoweredBy from "@/components/PoweredBy";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";

export default function Home() {
  return (
    <PageLoader>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <ProductPreview />
        <WhyBlitz />
        <Mission />
        <PoweredBy />
        <FAQ />
      </main>
      <Footer />
    </PageLoader>
  );
}
