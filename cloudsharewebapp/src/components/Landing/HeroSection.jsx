const HeroSection = ({ openSignIn, openSignUp }) => {
  return (
    <section className="relative overflow-hidden bg-purple-50">

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 pointer-events-none -z-10"></div>

      {/* Text Section */}
      <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28 text-center relative z-0">
        <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
          <span className="block text-black">Share Files Securely with</span>
          <span className="block text-purple-600">CloudShare</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-700 font-normal sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Upload, manage, and share your files securely. Accessible anywhere, anytime.
        </p>

        {/* Buttons */}
        <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center relative z-10">
          <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:grid sm:grid-cols-2 sm:gap-5">
            <button
              onClick={openSignUp}
              className="flex items-center px-6 py-3 md:py-4 md:px-10 md:text-lg font-medium rounded-md text-white bg-purple-500 hover:bg-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 relative z-10"
            >
              Get Started
            </button>
            <button
              onClick={openSignIn}
              className="flex items-center justify-center px-6 py-3 md:py-4 md:px-10 md:text-lg font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 hover:text-gray-900 shadow-lg hover:shadow-xl transition-all duration-200 relative z-10"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Image Section */}

      <div className="-mt-10 flex flex-col items-center text-center relative z-0">
        <div className="rounded-lg shadow-xl overflow-hidden max-w-4xl w-full">
        <img
        src="/Dashboard.png"
        alt="cloudshare dashboard"
        className="w-full h-auto object-cover"
        />
       </div>
      <p className="mt-6 text-base text-gray-500 max-w-2xl">
      All your files are encrypted and stored securely with enterprise-grade security protocols.
     </p>
    </div>

    </section>
  );
};

export default HeroSection;
