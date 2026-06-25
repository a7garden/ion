import type { TextOverlayColor } from '@/types';

interface CollageOverlayProps {
  text: string;
  color?: TextOverlayColor;
  customColor?: string;
  /** 텍스트 폰트 사이즈 (카드=14, 모달=18 등) */
  fontSize?: number;
}

/**
 * 인스타 스토리 콜라주 — 미디어 위에 텍스트를 오버레이.
 * PostCard(피드 노드)와 ExpandedCard(모달)가 공유.
 */
export function CollageOverlay({
  text,
  color,
  customColor,
  fontSize = 14,
}: CollageOverlayProps) {
  const textColor: 'white' | 'black' | 'color' =
    color === 'white' || color === 'black' || color === 'color' ? color : 'white';
  const resolved = textColor === 'color' ? customColor || '#ffffff' : textColor;
  const showGradient = textColor !== 'color';

  return (
    <>
      {showGradient && (
        <div
          className="absolute inset-x-0 bottom-0 h-3/5 pointer-events-none"
          style={{
            background:
              textColor === 'white'
                ? 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)'
                : 'linear-gradient(to top, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          }}
        />
      )}
      <div
        className="absolute inset-x-0 bottom-0 p-3 pointer-events-none flex items-end"
        style={{ minHeight: '40%' }}
      >
        <p
          className="w-full font-medium text-center whitespace-pre-wrap break-words"
          style={{
            fontSize,
            lineHeight: 1.35,
            color: resolved,
            textShadow:
              textColor === 'white'
                ? '0 1px 3px rgba(0,0,0,0.5)'
                : textColor === 'black'
                  ? '0 1px 2px rgba(255,255,255,0.4)'
                  : '0 1px 4px rgba(0,0,0,0.6)',
          }}
        >
          {text}
        </p>
      </div>
    </>
  );
}
