import React from 'react';
export { InFeedAd } from './InFeedAd';
export { AdSenseDisplayAd } from './AdSenseDisplayAd';

interface AdSlotProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'responsive';
  className?: string;
  label?: string;
}

export const AdSlot: React.FC<AdSlotProps> = () => {
  // Return null by default until specific ad units are explicitly configured
  return null;
};

export const DesktopAdSlot: React.FC<{ className?: string }> = () => null;
export const MobileAdSlot: React.FC<{ className?: string }> = () => null;

