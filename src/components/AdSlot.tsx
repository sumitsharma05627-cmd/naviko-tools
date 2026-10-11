import React from 'react';
import { AdSenseDisplayAd } from './AdSenseDisplayAd';

export { InFeedAd } from './InFeedAd';
export { AdSenseDisplayAd } from './AdSenseDisplayAd';

interface AdSlotProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
  label?: string;
  isToolLocked?: boolean;
  hasSubstantialContent?: boolean;
}

/**
 * Primary responsive AdSlot: scales automatically across mobile and desktop viewports
 * with strict Google AdSense route authorization and zero-dimension safety checks.
 */
export const AdSlot: React.FC<AdSlotProps> = ({
  className = '',
  format = 'auto',
  isToolLocked = false,
  hasSubstantialContent = true
}) => {
  return (
    <AdSenseDisplayAd
      className={className}
      format={format}
      isToolLocked={isToolLocked}
      hasSubstantialContent={hasSubstantialContent}
    />
  );
};

/**
 * Desktop & Tablet adaptive placement
 */
export const DesktopAdSlot: React.FC<{
  className?: string;
  isToolLocked?: boolean;
  hasSubstantialContent?: boolean;
}> = ({ className = '', isToolLocked = false, hasSubstantialContent = true }) => {
  return (
    <AdSenseDisplayAd
      className={className}
      isToolLocked={isToolLocked}
      hasSubstantialContent={hasSubstantialContent}
    />
  );
};

/**
 * MobileAdSlot returns null when paired alongside DesktopAdSlot to prevent
 * duplicate stacked ad units on small screens in violation of AdSense ad-density rules.
 */
export const MobileAdSlot: React.FC<{ className?: string }> = () => null;
