import Image from 'next/image';
import { FaCheckCircle } from 'react-icons/fa';

interface ProfileHeaderProps {
  profileData: {
    username?: string;
    full_name?: string;
    biography?: string;
    followers_count?: number;
    following_count?: number;
    media_count?: number;
    profile_pic_url?: string;
    is_verified?: boolean;
  };
}

export function ProfileHeader({ profileData }: ProfileHeaderProps) {
  // Função para criar URL de proxy segura
  const proxyImageUrl = (originalUrl: string) => {
    if (!originalUrl) return '/default-avatar.png';
    return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
  };

  // Fallback values to prevent undefined errors
  const username = profileData.username || 'N/A';
  const fullName = profileData.full_name || '';
  const biography = profileData.biography || 'Sem biografia';
  const followersCount = profileData.followers_count || 0;
  const followingCount = profileData.following_count || 0;
  const mediaCount = profileData.media_count || 0;
  const profilePicUrl = profileData.profile_pic_url || '';
  const isVerified = profileData.is_verified || false;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Foto do Perfil */}
        <div className="relative w-32 h-32">
          {profilePicUrl ? (
            <img
              src={proxyImageUrl(profilePicUrl)}
              alt={username}
              className="w-32 h-32 rounded-full object-cover"
              onError={(e: any) => {
                e.target.src = '/default-avatar.png';
              }}
            />
          ) : (
            <img
              src="/default-avatar.png"
              alt="Default avatar"
              className="w-32 h-32 rounded-full object-cover"
            />
          )}
          {isVerified && (
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1">
              <FaCheckCircle className="w-6 h-6 text-blue-500" />
            </div>
          )}
        </div>

        {/* Informações do Perfil */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <h2 className="text-2xl font-bold">@{username}</h2>
            {fullName && <span className="text-gray-500">{fullName}</span>}
          </div>

          <p className="text-gray-600 mb-4 max-w-2xl">
            {biography}
          </p>

          {/* Estatísticas */}
          <div className="flex items-center justify-center md:justify-start gap-8">
            <div className="text-center">
              <div className="text-xl font-bold">
                {followersCount.toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-gray-500">Seguidores</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">
                {followingCount.toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-gray-500">Seguindo</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">
                {mediaCount.toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
