import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import MenuSection from '../components/MenuSection';
import HowToOrder from '../components/HowToOrder';
import OrderForm from '../components/OrderForm';
import Footer from '../components/Footer';
import { trackVisit } from '../services/visitorService';

function Home() {
  useEffect(() => {
    trackVisit();
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <MenuSection />
      <HowToOrder />
      <OrderForm />
      <Footer />
    </>
  );
}
export default Home;