import React from 'react';

export default function ServiceCard({ imageSrc, title, description }) {
  return (
    <div className="group relative rounded-xl shadow-lg w-[320px] h-[500px] mt-20 flex flex-col transition-all duration-300 hover:shadow-xl">
      {/* Background image with overlay */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={imageSrc}
          alt={title}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content container with flex column layout */}
      <div className="relative flex flex-col h-full p-6 z-10">
        {/* Title at top */}
        <div className="text-center pt-4">
          <h3 className="text-2xl font-bold text-white  tracking-wide ">
            {title}
          </h3>
        </div>

        {/* Description in middle (centered vertically) */}
        <div className="flex-grow flex items-center justify-center">
          <p className="text-sm text-white text-center font-semibold opacity-90 max-w-[90%]">
            {description}
          </p>
        </div>

        {/* Button at bottom center */}
        <div className="text-center pb-4">
          <button 
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold py-3 px-8 rounded-full transition-colors duration-300"
            aria-label={`Learn more about ${title}`}
          >
            LEARN MORE
          </button>
        </div>
      </div>
    </div>
  );
}