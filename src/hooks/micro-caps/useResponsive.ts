import { useState, useEffect } from 'react';
import type { ResponsiveInfo } from '@/types/microCaps';

// 📱 HOOK PARA DETECTAR DISPOSITIVO E RESPONSIVIDADE
export function useResponsive(): ResponsiveInfo {
  const [responsiveInfo, setResponsiveInfo] = useState<ResponsiveInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1200,
    screenHeight: 800
  });

  useEffect(() => {
    const updateResponsiveInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Detectar mobile por width + user agent
      const isMobileByWidth = width <= 768;
      const isMobileByUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isMobile = isMobileByWidth || isMobileByUA;
      
      const isTablet = width > 768 && width <= 1024;
      const isDesktop = width > 1024;

      setResponsiveInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height
      });

      console.log('📱 Responsive Info:', {
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        userAgent: navigator.userAgent.substring(0, 50) + '...'
      });
    };

    // Executar na montagem
    updateResponsiveInfo();

    // Escutar mudanças de resize
    window.addEventListener('resize', updateResponsiveInfo);
    
    return () => window.removeEventListener('resize', updateResponsiveInfo);
  }, []);

  return responsiveInfo;
}