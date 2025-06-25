import React, { useState, useEffect } from "react";

const Footer = () => {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted install");
        } else {
          console.log("User dismissed install");
        }
        setInstallPrompt(null);
      });
    }
  };

  return (
    <footer className="w-full bg-cyan-700 text-white border-t border-gray-300 text-sm flex justify-center items-center h-12">
      <div className="flex flex-col sm:flex-row justify-center py-4 items-center gap-4">
        <span>© {new Date().getFullYear()} Stockastic v{import.meta.env.PACKAGE_VERSION}. All rights reserved.</span>
        {installPrompt && (
          <button
            onClick={handleInstallClick}
            className="bg-cyan-700 text-white px-3 py-1 rounded hover:bg-cyan-500 transition"
          >
            📥 Install App
          </button>
        )}
      </div>
    </footer>
  );
};

export default Footer;