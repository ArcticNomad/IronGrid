import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import Hero from './components/hero';
import WhyUs from './components/WhyUs';
import Services from './components/Services'; // Make sure the import path is correct

function App() {
  const [count, setCount] = useState(0);

  const servicesData = [
    {
      imageSrc: '/group.jpg', // Path to your first image
      title: 'GROUP FITNESS CLASSES',
      description:
        'Join our vibrant community through a variety of group fitness classes! From high-energy cardio sessions to calming yoga classes, we have something for everyone.',
    },
    {
      imageSrc: '/freeW.jpg', // Path to your second image
      title: 'FREE WEIGHTS TRAINING',
      description:
        'Experience the freedom of training with free weights! Our gym offers a wide range of free weight equipment, including dumbbells, barbells, and kettlebells.',
    },
    {
      imageSrc: '/personal.jpg', // Path to your third image
      title: 'PERSONAL TRAINING',
      description:
        'Achieve your fitness goals faster with personalized training sessions! Our certified personal trainers will work with you one-on-one to create a customized workout plan.',
    },
  ];

  return (
    <>
      <main className="bg-gradient-to-r from-gray-700 via-gray-900 to-gray-700 ">
        <section className="Hero">
          <Hero />
        </section>

        <section className="WhyUs shadow-2xl py-20">
          <WhyUs />
        </section>

        <section className="Services relative shadow-2xl bg-gradient-to-r from-gray-700 via-gray-900 to-gray-700 flex justify-center gap-[3vh] mb-20 py-12 px-14">
          <h1 className='absolute top-[2%] text-white text-5xl font-bold '>OUR <span className='text-red-400'>SERVICES</span></h1>
          {servicesData.map((service, index) => (
            <Services
              key={index}
              imageSrc={service.imageSrc}
              title={service.title}
              description={service.description}
            />
          ))}
        </section>

         <section className="bg-gradient-to-r from-gray-700 via-gray-900 to-gray-700 ">
          <WhyUs />
        </section>
      </main>
    </>
  );
}

export default App;