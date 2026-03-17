import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import MenuSection from '../components/MenuSection';
import OrderForm from '../components/OrderForm';
import Footer from '../components/Footer';

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <MenuSection />
      <OrderForm />
      <Footer />
    </>
  );
}
export default Home;