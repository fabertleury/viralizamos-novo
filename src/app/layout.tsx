import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { headers } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Script from 'next/script';
import ClientLayout from '@/components/layout/ClientLayout';

// Inicialização controlada para evitar duplicação
if (typeof window === 'undefined') {
  import('@/lib/services/startup').then(module => {
    module.ensureStartupServicesLoaded();
  });
}

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Viralizamos - Impulsione seu Instagram',
  description: 'Aumente seu alcance no Instagram com likes reais e seguidores engajados.',
  icons: {
    icon: '/images/favicon.png',
    shortcut: '/images/favicon.png',
    apple: '/images/favicon.png',
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Usar um valor padrão para o pathname em vez de tentar obtê-lo dos headers
  const pathname = '/';
  
  // Se for a rota raiz ou outras rotas públicas, não faz verificação
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/checkout')) {
    return (
      <html lang="pt-BR" suppressHydrationWarning>
        <head>
          {/* Favicon é configurado via metadata */}
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
            integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
          {/* Google Tag (gtag.js) */}
          <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-16904345570" strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-16904345570');
            `}
          </Script>
          {/* Microsoft Clarity */}
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "rchf046tcf");
            `}
          </Script>
        </head>
        <body className={inter.className} suppressHydrationWarning>
          <ClientLayout pathname={pathname} showFooter={!pathname.startsWith('/admin')}>
            {children}
          </ClientLayout>
        </body>
      </html>
    );
  }

  // Verificar autenticação
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/images/favicon.png" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {/* Google Tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-16904345570" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-16904345570');
          `}
        </Script>
        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "rchf046tcf");
          `}
        </Script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientLayout pathname={pathname} showFooter={!pathname.startsWith('/admin')}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
