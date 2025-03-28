import { FaInstagram } from 'react-icons/fa';
import './SocialCards.css';

interface Social {
  id: string;
  name: string;
  url: string;
  icon_url?: string;
  active: boolean;
}

interface SocialCardsProps {
  socialNetworks: Social[];
}

export function SocialCards({ socialNetworks }: SocialCardsProps) {
  return (
    <section className="social-cards-section">
      <div className="container">
        <div className="section-title">
          <h2>Turbine seus seguidores, curtidas, comentários e muito mais...</h2>
          <p>Escolha a rede social que você deseja impulsionar</p>
        </div>
        <div className="row">
          {socialNetworks.map((social) => (
            <div key={social.id} className="col-lg-4">
              <div className={`social-card ${social.active ? 'active' : 'disabled'}`}>
                <div className="icon">
                  {social.icon_url ? (
                    <img src={social.icon_url} alt={social.name} className="custom-icon" />
                  ) : (
                    <FaInstagram />
                  )}
                </div>
                <h3>Serviços para {social.name}</h3>
                <a 
                  href={social.active ? `/${social.url}` : '#'} 
                  className="btn-choose"
                >
                  Turbine Agora
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
