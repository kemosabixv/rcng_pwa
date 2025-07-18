import Image from 'next/image';

interface RotaryLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function RotaryLogo({ className = '', size = 'md' }: RotaryLogoProps) {
  const logoSizes = {
    sm: { width: 200, height: 53 },
    md: { width: 250, height: 67 },
    lg: { width: 300, height: 80 },
    xl: { width: 350, height: 93 }
  };

  return (
      <div className={`flex items-center ${className}`}>
        <Image
            src="/images/rotary-logo-full.svg"
            alt="Rotary Club of Nairobi Gigiri"
            width={logoSizes[size].width}
            height={logoSizes[size].height}
            priority
        />
      </div>
  );
}

export function RotaryLogoCompact({ className = '', size = 'sm' }: RotaryLogoProps) {
  const logoSizes = {
    sm: { width: 200, height: 53 },
    md: { width: 250, height: 67 },
    lg: { width: 300, height: 80 },
    xl: { width: 350, height: 93 }
  };

  return (
      <div className={`flex items-center ${className}`}>
        <Image
            src="/images/rotary-logo-full.svg"
            alt="Rotary Club of Nairobi Gigiri"
            width={logoSizes[size].width}
            height={logoSizes[size].height}
            priority
        />
      </div>
  );
}