import { useEffect, useRef } from 'react';

/**
 * Adds a `data-revealed="true"` attribute once the element enters
 * the viewport, triggering CSS entrance animations.
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-revealed', 'true');
          observer.disconnect();
        }
      },
      { threshold: options.threshold ?? 0.1, rootMargin: options.rootMargin ?? '0px 0px -40px 0px' }
    );

    const el = ref.current;
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return ref;
}
