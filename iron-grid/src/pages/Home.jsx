export default function Home() {
  const [count, setCount] = useState(0);

  const servicesData = [
    {
      imageSrc: "/group.jpg",
      title: "GROUP FITNESS CLASSES",
      description:
        "Join our vibrant community through a variety of group fitness classes! From high-energy cardio sessions to calming yoga classes, we have something for everyone.",
    },
    {
      imageSrc: "/freeW.jpg",
      title: "FREE WEIGHTS TRAINING",
      description:
        "Experience the freedom of training with free weights! Our gym offers a wide range of free weight equipment, including dumbbells, barbells, and kettlebells.",
    },
    {
      imageSrc: "/personal.jpg",
      title: "PERSONAL TRAINING",
      description:
        "Achieve your fitness goals faster with personalized training sessions! Our certified personal trainers will work with you one-on-one to create a customized workout plan.",
    },
  ];

  const trainersData = [
    {
      imageSrc: "/trainer.jpg",
      name: "THOMAS PERRY",
      specialty: "Strength Training",
      descriptionItems: [
        "Personalized training programs",
        "Functional training using kettlebells and TRX",
        "Nutrition and supplement advice",
      ],
    },
    {
      imageSrc: "/trainer.jpg",
      name: "ALEX MITCHELL",
      specialty: "Group Training",
      descriptionItems: [
        "High-intensity bootcamp sessions",
        "Crossfit and endurance training",
        "Mental training and motivation coaching",
      ],
    },
    {
      imageSrc: "/trainer.jpg",
      name: "ETHAN COLLINS",
      specialty: "Mobility & Recovery",
      descriptionItems: [
        "Therapeutic stretching sessions",
        "Yoga and mobility training",
        "Mindfulness and breathing techniques",
      ],
    },
  ];

  const pricingData = [
    {
      planName: "Flexfit",
      planType: "Regular",
      price: 0,
      currency: "Rs",
      period: "MONTH",
      features: [
        "24/7 gym access",
        "Unlimited access",
        "Locker access",
        "Towel service",
        "Workout Management",
        "Diet Planner",
        "Free consultation",
      ],
      unavailableFeatures: [
        "24/7 gym access",
        "Unlimited access",
        "Locker access",
        "Towel service",
      ],
      bestOffer: false,
      buttonText: "Choose Plan",
    },
    {
      planName: "Powerpro",
      planType: "Best",
      price: 3000,
      currency: "Rs",
      period: "MONTH",
      features: [
        "Unlimited access",
        "Fitness assessment",
        "Group classes",
        "2 training sessions",
        "24/7 gym access",
        "Locker access",
        "Towel service",
      ],
      unavailableFeatures: ["Towel service"],
      bestOffer: true,
      buttonText: "Choose Plan",
    },
    {
      planName: "Elitemax",
      planType: "Pro",
      price: 95,
      currency: "$",
      period: "MONTH",
      features: [
        "24/7 access",
        "Priority booking",
        "10 training sessions",
        "Exclusive workshops",
        "Premium app",
        "Locker access",
        "Towel service",
      ],
      unavailableFeatures: [],
      bestOffer: false,
      buttonText: "Choose Plan",
    },
  ];

  return (
    <div className="bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="hero-section">
        <Hero />
      </section>

      {/* Why Us Section */}
      <section className="why-us-section py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <WhyUs />
      </section>

      {/* Services Section */}
      <section className="services-section relative py-20 bg-gray-900 ">
        <div className="container mx-auto px-4">
          <h2 className="absolute top-10 left-0 right-0 text-center text-4xl md:text-5xl font-bold uppercase tracking-wide">
            OUR <span className="text-red-400 underline">SERVICES</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-8 mt-20">
            {servicesData.map((service, index) => (
              <Services
                key={index}
                imageSrc={service.imageSrc}
                title={service.title}
                description={service.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section py-24 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-4xl md:text-5xl font-bold uppercase tracking-wide mb-16">
            <span className="relative pb-2">
              OUR PRICES
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-red-500 rounded-full"></span>
            </span>
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            {pricingData.map((plan, index) => (
              <Prices key={index} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Trainers Section */}
      <section className="trainers-section relative py-24 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="absolute top-10 left-0 right-0 text-center text-4xl md:text-5xl font-bold uppercase tracking-wide">
            OUR <span className="text-red-400 underline">TRAINERS</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-8 mt-20">
            {trainersData.map((trainer, index) => (
              <Trainers
                key={index}
                imageSrc={trainer.imageSrc}
                name={trainer.name}
                specialty={trainer.specialty}
                descriptionItems={trainer.descriptionItems}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="hero-section">
        <JoinUs />
      </section>
    </div>
  );
}
