import React from 'react';
import { useVersion } from '../context/VersionContext';
import { HomePageV1 } from './HomePageV1';
import { HomePageV2 } from './HomePageV2';
import { HomePageV3 } from './HomePageV3';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenSearch }) => {
  const { version } = useVersion();

  if (version === 'v1') {
    return <HomePageV1 onNavigate={onNavigate} onOpenSearch={onOpenSearch} />;
  }

  if (version === 'v2') {
    return <HomePageV2 onNavigate={onNavigate} onOpenSearch={onOpenSearch} />;
  }

  // NAVIKO 3.0 (Astrology & Vastu) is the default product experience
  return <HomePageV3 onNavigate={onNavigate} onOpenSearch={onOpenSearch} />;
};
