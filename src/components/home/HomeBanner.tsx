'use client';

import React from 'react';
import ProfileAnalyzer from './ProfileAnalyzer';

const HomeBanner = () => {
  return (
    <section className="home-banner">
      <div className="container boxed">
        <div className="row align-items-center">
          <div className="col-md-6 mb-4 mb-md-0">
            <div className="area-texto">
              <h1 className="display-5 fw-bold">Compre Seguidores, Curtidas e Visualizações para Instagram</h1>
              <h3 className="mt-3">ANALISE SEU PERFIL COM NOSSA INTELIGÊNCIA ARTIFICIAL DE GRAÇA</h3>
              <h2>Descubra como melhorar seu perfil no Instagram e bombar nas redes!</h2>
              
              <ProfileAnalyzer />
              
              <p className="subtitle">Análise completa e gratuita do seu perfil em segundos!</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="hero" id="hero-ig-animation">
              <div className="_right_pic">
                <iframe
                  src="https://lottie.host/embed/3aebbf3c-f428-4e4f-8a2a-910a06b6510e/LhWjsbo9xB.lottie"
                  style={{ width: '100%', height: '500px', border: 'none' }}
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
      <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
        </defs>
        <g className="parallax">
          <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
          <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
          <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
          <use xlinkHref="#gentle-wave" x="48" y="7" fill="#fff" />
        </g>
      </svg>
    </section>
  );
};

export default HomeBanner;
