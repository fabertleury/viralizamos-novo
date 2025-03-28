import { useState } from 'react';
import { FaWhatsapp, FaFacebook, FaTwitter, FaDownload, FaShare } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ShareReportProps {
  username: string;
  profileData: any;
  contentData: any[];
  metrics: any;
  reportRef: React.RefObject<HTMLDivElement> | null;
}

export function ShareReport({ 
  username, 
  profileData, 
  contentData, 
  metrics, 
  reportRef 
}: ShareReportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    setIsExporting(true);
    toast.loading('Gerando relatório em PDF...');

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`analise-instagram-${username}.pdf`);
      
      toast.dismiss();
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateShareLink = async () => {
    try {
      // Inserir dados da análise no Supabase
      const { data, error } = await supabase
        .from('shared_analyses')
        .insert({
          username,
          profile_data: profileData,
          content_data: contentData,
          metrics
        })
        .select('id')
        .single();

      if (error) throw error;

      // Gerar link de compartilhamento
      const link = `${process.env.NEXT_PUBLIC_SITE_URL}/compartilhar/${data.id}`;
      setShareLink(link);

      // Links para compartilhamento
      const shareLinks = {
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `Confira a análise do perfil @${username} no Instagram: ${link}`
        )}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          link
        )}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          `Confira a análise do perfil @${username} no Instagram!`
        )}&url=${encodeURIComponent(link)}`,
      };

      // Copiar para área de transferência
      navigator.clipboard.writeText(link);
      toast.success('Link de compartilhamento copiado!');

      // Abrir WhatsApp
      window.open(shareLinks.whatsapp, '_blank');
    } catch (error) {
      console.error('Erro ao gerar link de compartilhamento:', error);
      toast.error('Erro ao gerar link. Tente novamente.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Análise do perfil @${username}`,
          text: `Confira a análise do perfil @${username} no Instagram!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2">
      {/* Botão de Compartilhamento Nativo (Mobile) */}
      {navigator.share && (
        <Button
          onClick={handleShare}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <FaShare className="w-5 h-5" />
        </Button>
      )}

      {/* Botões de Redes Sociais (Desktop) */}
      {!navigator.share && (
        <div className="flex flex-col gap-2">
          <Button
            onClick={generateShareLink}
            className="bg-green-500 hover:bg-green-600 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <FaWhatsapp className="w-5 h-5 text-white" />
          </Button>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              window.location.href
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <FaFacebook className="w-5 h-5 text-white" />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `Confira a análise do perfil @${username} no Instagram!`
            )}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-400 hover:bg-blue-500 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <FaTwitter className="w-5 h-5 text-white" />
          </a>
        </div>
      )}

      {/* Botão de Download PDF */}
      <Button
        onClick={handleExportPDF}
        disabled={isExporting}
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <FaDownload className="w-5 h-5" />
      </Button>
    </div>
  );
}
