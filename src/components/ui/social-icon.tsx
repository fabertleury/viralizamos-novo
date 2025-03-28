import { 
  FaInstagram, 
  FaTiktok, 
  FaFolder, 
  FaImage, 
  FaVideo, 
  FaMusic, 
  FaHeart, 
  FaStar, 
  FaShoppingCart, 
  FaUsers, 
  FaComment, 
  FaThumbsUp, 
  FaYoutube, 
  FaFacebook, 
  FaTwitter, 
  FaTwitch,
  FaEye,
  FaPlay,
  FaUser,
  FaShare,
  FaThumbsUp as FaThumbsUpOriginal,
  FaEye as FaEyeOriginal,
  FaLinkedin,
  FaWhatsapp,
  FaTelegram,
  FaDiscord,
  FaPinterest,
  FaReddit,
  FaSnapchat,
  FaSpotify,
  FaSoundcloud,
  FaVk,
  FaWeibo,
  FaLine
} from 'react-icons/fa';

interface SocialIconProps {
  name?: string;
  className?: string;
}

const iconMap: { [key: string]: any } = {
  // Redes Sociais
  'instagram': FaInstagram,
  'tiktok': FaTiktok,
  'youtube': FaYoutube,
  'facebook': FaFacebook,
  'twitter': FaTwitter,
  'twitch': FaTwitch,
  'linkedin': FaLinkedin,
  'whatsapp': FaWhatsapp,
  'telegram': FaTelegram,
  'discord': FaDiscord,
  'pinterest': FaPinterest,
  'reddit': FaReddit,
  'snapchat': FaSnapchat,
  'spotify': FaSpotify,
  'soundcloud': FaSoundcloud,
  'vk': FaVk,
  'weibo': FaWeibo,
  'line': FaLine,

  // Categorias e Métricas
  'folder': FaFolder,
  'image': FaImage,
  'video': FaVideo,
  'music': FaMusic,
  'heart': FaHeart,
  'star': FaStar,
  'cart': FaShoppingCart,
  'users': FaUsers,
  'comment': FaComment,
  'thumbs-up': FaThumbsUp,
  'likes': FaHeart,
  'comments': FaComment,
  'views': FaEyeOriginal,
  'plays': FaPlay,
  'followers': FaUser,
  'shares': FaShare,
  'engagement': FaUsers,
  'reactions': FaThumbsUpOriginal,
  'favorites': FaStar,
};

export function SocialIcon({ name = 'folder', className = "w-5 h-5" }: SocialIconProps) {
  const Icon = name ? iconMap[name.toLowerCase()] || FaFolder : FaFolder;
  return <Icon className={className} />;
}
