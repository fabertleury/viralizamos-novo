import { Card } from '@/components/ui/card';

export function HowItWorksSection() {
  return (
    <section 
      className="relative w-full py-20 bg-cover bg-center"
      style={{
        backgroundImage: 'url(/background.png)'
      }}
    >
      {/* Gradiente sobreposto mais suave */}
      <div 
        className="absolute inset-0 z-0" 
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%)'
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Título centralizado */}
        <h2 
          className="text-4xl font-bold text-center text-white mb-16 uppercase tracking-wider" 
          style={{ fontFamily: 'Quicksand, sans-serif' }}
        >
          Descubra como contratar 
          <br />
          os nossos serviços
        </h2>

        <div className="flex flex-col items-center justify-center w-full">
          {/* Container de Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
            <Card 
              className="p-6 bg-white/95 backdrop-blur-sm transform transition duration-300 hover:scale-105 hover:shadow-2xl 
                         border border-blue-100 rounded-2xl shadow-lg flex items-center space-x-6"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl text-blue-600">🌐</span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="text-5xl mb-2 text-blue-800 font-bold">1</div>
                <h3 className="text-2xl font-semibold mb-3 text-blue-900">
                  Escolha uma rede social
                </h3>
                <p className="text-blue-800 text-base leading-relaxed">
                  No nosso site você encontra todas as redes sociais que podemos impulsionar.
                </p>
              </div>
            </Card>

            <Card 
              className="p-6 bg-white/95 backdrop-blur-sm transform transition duration-300 hover:scale-105 hover:shadow-2xl 
                         border border-green-100 rounded-2xl shadow-lg flex items-center space-x-6"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl text-green-600">📊</span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="text-5xl mb-2 text-green-800 font-bold">2</div>
                <h3 className="text-2xl font-semibold mb-3 text-green-900">
                  Escolha uma métrica
                </h3>
                <p className="text-green-800 text-base leading-relaxed">
                  Escolha qual métrica você quer turbinar. Exemplo: Seguidores para Instagram.
                </p>
              </div>
            </Card>

            <Card 
              className="p-6 bg-white/95 backdrop-blur-sm transform transition duration-300 hover:scale-105 hover:shadow-2xl 
                         border border-purple-100 rounded-2xl shadow-lg flex items-center space-x-6"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl text-purple-600">💳</span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="text-5xl mb-2 text-purple-800 font-bold">3</div>
                <h3 className="text-2xl font-semibold mb-3 text-purple-900">
                  Conclua seu pedido
                </h3>
                <p className="text-purple-800 text-base leading-relaxed">
                  Preencha os campos necessários e efetue o pagamento.
                </p>
              </div>
            </Card>

            <Card 
              className="p-6 bg-white/95 backdrop-blur-sm transform transition duration-300 hover:scale-105 hover:shadow-2xl 
                         border border-orange-100 rounded-2xl shadow-lg flex items-center space-x-6"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl text-orange-600">🏆</span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="text-5xl mb-2 text-orange-800 font-bold">4</div>
                <h3 className="text-2xl font-semibold mb-3 text-orange-900">
                  Aproveite a fama!
                </h3>
                <p className="text-orange-800 text-base leading-relaxed">
                  Relaxe e veja a sua rede social sendo turbinada.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
