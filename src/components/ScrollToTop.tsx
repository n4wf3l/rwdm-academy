import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Remonte tout en haut
  }, [pathname]); // Se déclenche à chaque changement de page

  return null;
};

export default ScrollToTop;
