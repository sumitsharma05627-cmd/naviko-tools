import React from 'react';
import { useVersion } from '../context/VersionContext';
import { HomePageV1 } from './HomePageV1';
import { HomePageV2 } from './HomePageV2';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenSearch }) => {
  const { version } = useVersion();

  if (version === 'v2') {
    return <HomePageV2 onNavigate={onNavigate} onOpenSearch={onOpenSearch} />;
  }

  return <HomePageV1 onNavigate={onNavigate} onOpenSearch={onOpenSearch} />;
};
