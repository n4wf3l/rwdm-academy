
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTransitionProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  animateIn?: string;
  animateOut?: string;
  duration?: number;
}

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  show,
  children,
  className,
  animateIn = 'animate-scale-in',
  animateOut = 'animate-scale-out',
  duration = 400,
}) => {
  const [shouldRender, setShouldRender] = useState(show);
  const [animation, setAnimation] = useState(show ? animateIn : animateOut);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setAnimation(animateIn);
    } else {
      setAnimation(animateOut);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, animateIn, animateOut, duration]);

  return shouldRender ? (
    <div className={cn(className, animation)}>
      {children}
    </div>
  ) : null;
};

export default AnimatedTransition;
