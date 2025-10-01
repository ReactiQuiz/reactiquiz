import type { ReportCallback } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: ReportCallback) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then((webVitals) => {
      // Support both v3 named and v4 default export shapes
      const getCLS = (webVitals as any).getCLS || (webVitals as any).onCLS;
      const getFID = (webVitals as any).getFID || (webVitals as any).onFID;
      const getFCP = (webVitals as any).getFCP || (webVitals as any).onFCP;
      const getLCP = (webVitals as any).getLCP || (webVitals as any).onLCP;
      const getTTFB = (webVitals as any).getTTFB || (webVitals as any).onTTFB;

      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
