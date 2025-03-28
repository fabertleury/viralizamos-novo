'use client';

import React, { useState } from 'react';
import { 
  FaInstagram, 
  FaUser, 
  FaCog, 
  FaLock, 
  FaUnlock, 
  FaTimes 
} from 'react-icons/fa';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function PrivateTutorial({ 
  onClose 
}: { 
  onClose: () => void 
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      title: "Abra o Instagram",
      description: "Acesse o aplicativo do Instagram no seu celular",
      icon: <FaInstagram />
    },
    {
      title: "Acesse seu Perfil",
      description: "Toque no ícone do seu perfil no canto inferior direito",
      icon: <FaUser />
    },
    {
      title: "Menu de Configurações",
      description: "Toque no menu (três linhas) e depois em 'Configurações e privacidade'",
      icon: <FaCog />
    },
    {
      title: "Privacidade da Conta",
      description: "Selecione 'Privacidade da conta' nas configurações",
      icon: <FaLock />
    },
    {
      title: "Conta Pública",
      description: "Desative a opção 'Conta privada' para tornar seu perfil público",
      icon: <FaUnlock />
    }
  ];

  const handleNextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const CurrentStep = tutorialSteps[currentStep];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-modal">
        <button className="close-tutorial" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="tutorial-content">
          <div className="tutorial-header">
            <h3>Como tornar seu perfil público</h3>
            <p className="step-indicator">
              Passo {currentStep + 1} de {tutorialSteps.length}
            </p>
          </div>

          <div className="tutorial-step">
            <h4>{CurrentStep.title}</h4>
            <div className="tutorial-icon-container">
              {CurrentStep.icon}
            </div>
            <p>{CurrentStep.description}</p>
          </div>

          <div className="tutorial-navigation">
            <button
              className="nav-button prev"
              onClick={handlePrevStep}
              disabled={currentStep === 0}
            >
              Anterior
            </button>
            <button
              className="nav-button next"
              onClick={handleNextStep}
            >
              {currentStep === tutorialSteps.length - 1 ? 'Concluir' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
