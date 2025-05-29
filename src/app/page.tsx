'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import CookieConsent from '@/components/CookieConsent';
import DepoimentosSection from '@/components/home/DepoimentosSection';
import ServicosSection from '@/components/home/ServicosSection';
import FAQSection from '@/components/home/FAQSection';
import RedesSociaisSection from '@/components/home/RedesSociaisSection';
import HomeBanner from '@/components/home/HomeBanner';
import FloatingButtons from '@/components/home/FloatingButtons';
import SocialNetworksSection from '@/components/home/SocialNetworksSection';
import './styles.css';

export default function HomePage() {
  return (
    <div>
      <CookieConsent />
      <main className="home-v3">
        <Header />
        
        <HomeBanner />
        <SocialNetworksSection />
        <ServicosSection />
        <RedesSociaisSection />
        <DepoimentosSection />
        <FAQSection />
      </main>

      <FloatingButtons />
    </div>
  );
}