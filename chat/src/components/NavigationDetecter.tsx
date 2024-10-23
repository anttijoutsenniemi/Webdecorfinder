import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const useNavigationDetection = (onBack: () => void, onForward: () => void) => {
    const location = useLocation();
    const navigationType = useNavigationType();
    const previousLocationsRef = useRef<string[]>([]);
  
    useEffect(() => {
      const currentLocationKey = location.key;
  
      if (navigationType === 'POP') {
        const previousLocations = previousLocationsRef.current;
        const previousLocation = previousLocations[previousLocations.length - 2];
  
        if (previousLocation === currentLocationKey) {
          onBack();
          previousLocationsRef.current = previousLocations.slice(0, -1);
        } else {
          onForward();
          previousLocationsRef.current.push(currentLocationKey);
        }
      } else if (navigationType === 'PUSH') {
        previousLocationsRef.current.push(currentLocationKey);
      }
    }, [location.key, navigationType, onBack, onForward]);
  };


export default useNavigationDetection;
