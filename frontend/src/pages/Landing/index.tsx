import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import HeroSection from './HeroSection';
import BookingSection from './BookingSection';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <BookingSection />
      </main>
      <Footer />
    </>
  );
}
