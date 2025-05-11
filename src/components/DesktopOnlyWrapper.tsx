import React, { useEffect, useState } from "react";

const DesktopOnlyWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isDesktop) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-6 bg-white dark:bg-black">
        <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-6" />
        <h1 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-2">
          Vue non disponible
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Cette interface d’administration est uniquement accessible sur
          ordinateur.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default DesktopOnlyWrapper;
