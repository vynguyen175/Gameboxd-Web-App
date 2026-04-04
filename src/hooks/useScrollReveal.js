import { useEffect, useRef } from 'react';

function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.classList.add('scroll-reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: options.threshold || 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold]);

  return ref;
}

export default useScrollReveal;
