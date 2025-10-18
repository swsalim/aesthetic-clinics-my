'use client';

import { useEffect, useState } from 'react';

import BannerCodefast from '@/components/ads/banner-codefast';
import BannerFrogDr from '@/components/ads/banner-frogdr';
import BannerRandomnumber from '@/components/ads/banner-random-number';

type BannerVersion = 'Codefast' | 'Frogdr' | 'Randomnumber';

interface BannerAssignment {
  version: BannerVersion;
  expiresAt: number;
  bannerHistory: BannerVersion[];
}

declare function sa_event(eventName: string): void;

export default function RotatingBanner() {
  const [bannerVersion, setBannerVersion] = useState<BannerVersion | null>(null);

  useEffect(() => {
    // Function to assign a new banner version
    const assignNewBanner = (previousVersions: BannerVersion[] = []): BannerAssignment => {
      // All possible banner versions
      const allVersions: BannerVersion[] = ['Codefast', 'Frogdr', 'Randomnumber'];

      // Filter out recently shown banners if possible
      let availableVersions = allVersions;
      if (previousVersions.length > 0 && previousVersions.length < allVersions.length) {
        availableVersions = allVersions.filter((v) => !previousVersions.includes(v));
      }

      // Choose a random banner from available versions
      const randomIndex = Math.floor(Math.random() * availableVersions.length);
      const version = availableVersions[randomIndex];

      // Add to history, keeping only the most recent banners
      const bannerHistory = [...previousVersions, version].slice(-2); // Keep last 2

      // Set expiration (2 weeks)
      const expiresAt = Date.now() + 14 * 24 * 60 * 60 * 1000;

      return { version, expiresAt, bannerHistory };
    };

    // Check if user has a banner assignment
    const storedAssignment = localStorage.getItem('banner_assignment');
    let assignment: BannerAssignment;

    if (storedAssignment) {
      const parsedAssignment = JSON.parse(storedAssignment) as BannerAssignment;

      if (parsedAssignment.expiresAt > Date.now()) {
        // Assignment is still valid
        assignment = parsedAssignment;
      } else {
        // Assignment expired, create a new one with history awareness
        assignment = assignNewBanner(parsedAssignment.bannerHistory);
        localStorage.setItem('banner_assignment', JSON.stringify(assignment));
      }
    } else {
      // No stored assignment, create a new one
      assignment = assignNewBanner();
      localStorage.setItem('banner_assignment', JSON.stringify(assignment));
    }

    setBannerVersion(assignment.version);
    trackImpression(assignment.version);
  }, []);

  if (!bannerVersion) return null;

  const handleBannerClick = (): void => {
    if (bannerVersion) {
      trackClick(bannerVersion);
    }
  };

  return (
    <div
      className="relative z-50 hidden border border-b-yellow-300 bg-yellow-50 lg:block"
      onClick={handleBannerClick}
      role="banner"
      aria-label="Advertisement banner">
      <div className="mx-auto max-w-7xl">
        {bannerVersion === 'Codefast' && <BannerCodefast />}
        {bannerVersion === 'Frogdr' && <BannerFrogDr />}
        {bannerVersion === 'Randomnumber' && <BannerRandomnumber />}
      </div>
    </div>
  );
}

function trackImpression(version: BannerVersion): void {
  // eslint-disable-next-line
  sa_event(`Banner ${version} impression`);
}

function trackClick(version: BannerVersion): void {
  // eslint-disable-next-line
  sa_event(`Banner ${version} click`);
}
