import React, { useState } from 'react';
import { FaWhatsapp, FaFilePdf, FaSpinner } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFShareButtonProps {
  profileData: any;
  contentData: any[];
  metrics: any;
  engagementProjection?: any;
}

export function PDFShareButton({ 
  profileData, 
  contentData, 
  metrics, 
  engagementProjection 
}: PDFShareButtonProps) {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Título do relatório
      doc.setFontSize(20);
      doc.text('Relatório de Análise de Perfil', pageWidth / 2, 20, { align: 'center' });

      // Informações básicas do perfil
      doc.setFontSize(12);
      doc.text(`Usuário: ${profileData.username}`, 20, 40);
      doc.text(`Seguidores: ${profileData.followers_count}`, 20, 50);
      doc.text(`Seguindo: ${profileData.following_count}`, 20, 60);

      // Métricas de Engajamento
      doc.setFontSize(16);
      doc.text('Métricas de Engajamento', 20, 80);
      doc.setFontSize(12);
      doc.text(`Total de Posts: ${contentData.length}`, 20, 90);
      doc.text(`Total de Curtidas: ${metrics.totalLikes}`, 20, 100);
      doc.text(`Total de Comentários: ${metrics.totalComments}`, 20, 110);

      // Projeção de Engajamento
      if (engagementProjection) {
        doc.setFontSize(16);
        doc.text('Projeção de Engajamento', 20, 130);
        doc.setFontSize(12);
        doc.text(`Seguidores Projetados: ${engagementProjection.followers}`, 20, 140);
        doc.text(`Curtidas Projetadas: ${engagementProjection.likes}`, 20, 150);
        doc.text(`Comentários Projetados: ${engagementProjection.comments}`, 20, 160);
      }

      // Salvar PDF
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Compartilhar via WhatsApp
      const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
        `Confira meu relatório de análise de perfil do Instagram: ${pdfUrl}`
      )}`;

      window.open(whatsappShareUrl, '_blank');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <button 
        onClick={generatePDF}
        disabled={loading}
        className="flex items-center bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
      >
        {loading ? (
          <FaSpinner className="animate-spin mr-2" />
        ) : (
          <FaWhatsapp className="mr-2" />
        )}
        {loading ? 'Gerando Relatório...' : 'Compartilhar Relatório no WhatsApp'}
      </button>
    </div>
  );
}
