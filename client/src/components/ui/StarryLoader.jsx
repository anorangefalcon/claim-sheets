import React from "react";

const StarryLoader = ({ message = "Processing bills with AI..." }) => {
  return (
    <>
      {/* Add CSS animations as a style tag */}
      <style>
        {`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          
          @keyframes shooting-star {
            0% {
              transform: translateY(-12px) translateX(0) rotate(45deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(400px) translateX(400px) rotate(45deg);
              opacity: 0;
            }
          }
          
          @keyframes progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
          
          .animate-progress {
            animation: progress 2s ease-in-out infinite;
          }
        `}
      </style>

      <div className="relative">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-900/90 backdrop-blur-sm rounded-lg">
          {/* Animated stars */}
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            {/* Large stars */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`large-${i}`}
                className="absolute w-2 h-2 bg-white rounded-full opacity-80"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `twinkle ${2 + Math.random() * 2}s infinite ${
                    Math.random() * 2
                  }s`,
                }}
              />
            ))}

            {/* Medium stars */}
            {[...Array(12)].map((_, i) => (
              <div
                key={`medium-${i}`}
                className="absolute w-1.5 h-1.5 bg-yellow-200 rounded-full opacity-70"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `twinkle ${1.5 + Math.random() * 2}s infinite ${
                    Math.random() * 2
                  }s`,
                }}
              />
            ))}

            {/* Small stars */}
            {[...Array(20)].map((_, i) => (
              <div
                key={`small-${i}`}
                className="absolute w-1 h-1 bg-blue-200 rounded-full opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `twinkle ${1 + Math.random() * 2}s infinite ${
                    Math.random() * 2
                  }s`,
                }}
              />
            ))}

            {/* Shooting stars */}
            {[...Array(3)].map((_, i) => (
              <div
                key={`shooting-${i}`}
                className="absolute w-0.5 h-12 bg-gradient-to-b from-white to-transparent opacity-80"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: "-12px",
                  transform: "rotate(45deg)",
                  animation: `shooting-star ${
                    3 + Math.random() * 2
                  }s infinite ${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-64 px-8 text-center">
            {/* AI Icon with glow */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-50 blur-lg animate-pulse" />
              <div className="relative w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>

            {/* Loading text */}
            <h3 className="text-xl font-semibold text-white mb-2">{message}</h3>
            <p className="text-blue-200 mb-6 max-w-md">
              Our AI is reading your bills and extracting expense information.
              This may take a few moments.
            </p>

            {/* Progress animation */}
            <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-progress" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StarryLoader;
