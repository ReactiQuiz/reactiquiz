/**
 * Web Vitals Reporting
 * 
 * This module handles reporting of Core Web Vitals and other performance metrics.
 * Web Vitals are metrics that measure real-world user experience on the web.
 * 
 * Core Web Vitals tracked:
 * - CLS (Cumulative Layout Shift): Measures visual stability
 * - FID (First Input Delay): Measures interactivity
 * - FCP (First Contentful Paint): Measures perceived loading speed
 * - LCP (Largest Contentful Paint): Measures loading performance
 * - TTFB (Time to First Byte): Measures server response time
 */
import type { ReportCallback } from 'web-vitals';

/**
 * Report Web Vitals
 * 
 * Dynamically imports the web-vitals library and registers callbacks for all
 * performance metrics. This function supports both web-vitals v3 (named exports)
 * and v4 (default export) to maintain compatibility.
 * 
 * The function only registers callbacks if a valid callback function is provided,
 * allowing the application to optionally collect performance metrics.
 * 
 * @param {ReportCallback} onPerfEntry - Optional callback function that receives performance entries.
 *                                       Called whenever a web vital metric is measured.
 * 
 * Usage:
 *   In index.tsx or App.tsx, call: reportWebVitals((metric) => console.log(metric));
 */
const reportWebVitals = (onPerfEntry?: ReportCallback) => {
  // Only proceed if a valid callback function is provided
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    // Dynamically import web-vitals to avoid loading it unless needed
    import('web-vitals').then((webVitals) => {
      // Support both v3 named and v4 default export shapes
      // Try named exports first (v3), fall back to default export methods (v4)
      const getCLS = (webVitals as any).getCLS || (webVitals as any).onCLS;
      const getFID = (webVitals as any).getFID || (webVitals as any).onFID;
      const getFCP = (webVitals as any).getFCP || (webVitals as any).onFCP;
      const getLCP = (webVitals as any).getLCP || (webVitals as any).onLCP;
      const getTTFB = (webVitals as any).getTTFB || (webVitals as any).onTTFB;

      // Register callback for each web vital metric
      getCLS(onPerfEntry); // Cumulative Layout Shift - visual stability
      getFID(onPerfEntry); // First Input Delay - interactivity
      getFCP(onPerfEntry); // First Contentful Paint - initial render
      getLCP(onPerfEntry); // Largest Contentful Paint - loading performance
      getTTFB(onPerfEntry); // Time to First Byte - server response time
    });
  }
};

export default reportWebVitals;
