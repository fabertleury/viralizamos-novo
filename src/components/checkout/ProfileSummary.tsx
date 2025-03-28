'use client';

import { ProfileData } from '@/app/checkout/instagram/types';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { getProxiedImageUrl } from '@/app/checkout/instagram/utils/proxy-image';

interface ProfileSummaryProps {
  profileData: ProfileData;
  className?: string;
}

export function ProfileSummary({ profileData, className = '' }: ProfileSummaryProps) {
  const proxiedImageUrl = getProxiedImageUrl(profileData.profile_pic_url);
  
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden">
          <Image
            src={proxiedImageUrl}
            alt={profileData.username}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        <div>
          <h2 className="font-bold text-lg">{profileData.full_name}</h2>
          <p className="text-gray-600">@{profileData.username}</p>
          <div className="flex gap-4 mt-1 text-sm">
            <span>{profileData.follower_count.toLocaleString()} seguidores</span>
            <span>{profileData.following_count.toLocaleString()} seguindo</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
