"use client";
import Image from "next/image";
import { useState } from "react";

const Downloads = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("windows");

  const platforms = [
    {
      id: "windows",
      name: "Windows",
      icon: "/images/games/extra4.png",
      url: "https://drive.google.com/file/d/1sNZXkOK9aLOtkLAh4yScnCzA_ROGcdhk/view?usp=sharing",
    },
    {
      id: "mac",
      name: "MacOS",
      icon: "/images/games/extra3.png",
      url: "https://drive.google.com/file/d/1sNZXkOK9aLOtkLAh4yScnCzA_ROGcdhk/view?usp=sharing",
    },
    {
      id: "linux",
      name: "Linux",
      icon: "/images/games/extra5.png",
      url: "https://drive.google.com/file/d/1sNZXkOK9aLOtkLAh4yScnCzA_ROGcdhk/view?usp=sharing",
    },
  ];

  const handlePlatformChange = (platformId) => {
    setSelectedPlatform(platformId);
  };

  const selectedPlatformDetails = platforms.find(
    (platform) => platform.id === selectedPlatform,
  );

  return (
    <div className="min-h-screen bg-transparent text-black dark:text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-10 text-center text-4xl font-bold">
          Download Our 3D World
        </h1>
        <p className="mb-12 text-center text-lg">
          Choose your platform and get started with an immersive gaming
          experience.
        </p>

        {/* Platform Selector */}
        <div className="mb-12 flex justify-center space-x-6">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handlePlatformChange(platform.id)}
              className={`flex transform flex-col items-center space-y-2 rounded-lg p-4 shadow-lg transition-all duration-300 hover:scale-105 ${
                selectedPlatform === platform.id
                  ? "bg-primary text-black"
                  : "bg-gray-300/50 dark:bg-gray-800/50"
              }`}
            >
              <Image
                src={platform.icon}
                alt={platform.name}
                width={64}
                height={64}
              />
              <span className="font-semibold">{platform.name}</span>
            </button>
          ))}
        </div>

        {/* Download Section */}
        <div className="text-center">
          <h2 className="mb-6 text-2xl font-semibold">
            Download for {selectedPlatformDetails?.name}
          </h2>
          <a
            href={selectedPlatformDetails?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-primary-dark inline-block rounded-lg bg-primary px-6 py-3 text-lg font-bold text-black transition-all duration-300"
          >
            Download Now
          </a>
        </div>

        {/* Game Features */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-slate-500/50 p-6 shadow-lg dark:bg-slate-800/50">
            <h3 className="mb-4 text-xl font-bold">Immersive Graphics</h3>
            <p>
              Experience stunning visuals and breathtaking environments that
              make gameplay more engaging.
            </p>
          </div>
          <div className="rounded-lg bg-slate-500/50 p-6 shadow-lg dark:bg-gray-800/50">
            <h3 className="mb-4 text-xl font-bold">Multiplayer Mode</h3>
            <p>
              Connect with friends and players around the globe to enhance your
              gaming experience.
            </p>
          </div>
          <div className="rounded-lg bg-slate-500/50 p-6 shadow-lg dark:bg-gray-800/50">
            <h3 className="mb-4 text-xl font-bold">Frequent Updates</h3>
            <p>
              Enjoy new content, improvements, and bug fixes with regular
              updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Downloads;
