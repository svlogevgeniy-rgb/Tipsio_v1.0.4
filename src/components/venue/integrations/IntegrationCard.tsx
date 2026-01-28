import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from '@/i18n/client';

interface IntegrationCardProps {
  name: string;
  logo: string;
  isConnected?: boolean;
  isDisabled?: boolean;
  comingSoonText?: string;
  onClick?: () => void;
}

export function IntegrationCard({
  name,
  logo,
  isConnected = false,
  isDisabled = false,
  comingSoonText,
  onClick,
}: IntegrationCardProps) {
  const [imageError, setImageError] = useState(false);
  const t = useTranslations('venue.settings.integrations');

  return (
    <Card
      className={`glass transition-all ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:border-primary/50 hover:shadow-lg'
      }`}
      onClick={isDisabled ? undefined : onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="relative h-12 w-32">
            {!imageError ? (
              <Image
                src={logo}
                alt={`${name} logo`}
                fill
                className="object-contain object-left"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center h-full">
                <span className="text-lg font-heading font-bold text-primary">
                  {name}
                </span>
              </div>
            )}
          </div>
          {isConnected && (
            <span className="flex items-center gap-1 text-sm text-green-400">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-heading font-semibold mb-2">{name}</h3>
        
        {isDisabled && comingSoonText && (
          <p className="text-sm text-muted-foreground">{comingSoonText}</p>
        )}
        
        {!isDisabled && isConnected && (
          <p className="text-sm text-green-400">{t('connected')}</p>
        )}
        
        {!isDisabled && !isConnected && (
          <p className="text-sm text-muted-foreground">{t('clickToSetup')}</p>
        )}
      </CardContent>
    </Card>
  );
}
