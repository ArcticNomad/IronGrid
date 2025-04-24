import './App.css';

import NavBar from './Components/NavBar';
import HeroSection from './Sections/HeroSection';
import WhyUs from './Sections/WhyUs';
import Services from './Sections/Services';
import Trainers from './Sections/Trainers';
import Pricing from './Sections/Pricing';
import JoinUs from './Sections/JoinUs';
import Footer from './Sections/Footer';

function App() {
  return (
    <>
      <main className="main-container">
        <NavBar />

        <section className="hero-section">
          <HeroSection />
        </section>

        <section className="why-us-section">
          <WhyUs />
        </section>

        <section className="services-section">
          <Services />
        </section>

        <section className="trainers-section">
          <Trainers />
        </section>

        <section className="pricing-section">
          <Pricing />
        </section>

        <section className="join-us-section">
          <JoinUs />
        </section>

        <section className="footer-section">
          <Footer />
        </section>
      </main>
    </>
  );
}

export default App;
