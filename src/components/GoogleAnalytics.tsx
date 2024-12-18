import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA4 from 'react-ga4';

export function GoogleAnalytics() {
  const location = useLocation();
  const isDevelopment = import.meta.env.DEV;

  useEffect(() => {
    // Development modunda izleme yapma
    if (isDevelopment) {
      console.log('Google Analytics izlemesi development modunda devre dışı:', {
        page: location.pathname + location.search
      });
      return;
    }

    ReactGA4.send({
      hitType: "pageview",
      page: location.pathname + location.search
    });
  }, [location, isDevelopment]);

  return null;
} 