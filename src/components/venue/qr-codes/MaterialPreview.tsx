/* eslint-disable @next/next/no-img-element */
import React from "react";
import { QrDesignState } from "@/lib/qr-materials";

interface MaterialPreviewProps {
  design: QrDesignState;
  qrDataUrl: string;
  venueName: string;
}

export const MaterialPreview = ({
  design,
  qrDataUrl,
  venueName,
}: MaterialPreviewProps) => {
  const { materialType, baseColor, accentColor, ctaText, showLogo, logoUrl } =
    design;

  const bgStyle = { backgroundColor: baseColor };
  const textStyle = { color: accentColor };

  const Content = ({ scale = 1 }: { scale?: number }) => (
    <div
      className="flex flex-col items-center justify-center text-center p-4 h-full w-full"
      style={bgStyle}
    >
      {showLogo && logoUrl && (
        <img
          src={logoUrl}
          alt="Logo"
          width={Math.round(24 * scale)}
          height={Math.round(24 * scale)}
          className="mb-2 object-contain"
          loading="lazy"
        />
      )}
      <h3
        className="font-bold mb-2 leading-tight"
        style={{ ...textStyle, fontSize: `${0.9 * scale}rem` }}
      >
        {ctaText}
      </h3>

      <div className="bg-white p-2 rounded-md shadow-sm">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QR Code"
            width={Math.round(80 * scale)}
            height={Math.round(80 * scale)}
            className="object-contain"
            loading="lazy"
          />
        ) : (
          <div
            className="bg-slate-200/70"
            style={{
              width: Math.round(80 * scale),
              height: Math.round(80 * scale),
            }}
            aria-hidden="true"
          />
        )}
      </div>

      <p
        className="mt-2 opacity-80 font-medium"
        style={{ ...textStyle, fontSize: `${0.6 * scale}rem` }}
      >
        {venueName}
      </p>
    </div>
  );

  // Table Tent - A4 folded
  if (materialType === "table-tent") {
    return (
      <div
        className="w-full aspect-[3/4] rounded-lg overflow-hidden relative"
        style={bgStyle}
      >
        <div className="absolute inset-0 flex flex-col">
          <div className="h-1/2 border-b border-dashed border-gray-300/50 flex items-center justify-center opacity-30">
            <div className="transform rotate-180 scale-75">
              <Content scale={0.8} />
            </div>
          </div>
          <div className="h-1/2 flex items-center justify-center">
            <Content />
          </div>
        </div>
        <div className="absolute top-1 right-1 text-[8px] text-gray-400 bg-white/80 px-1 rounded">
          A4
        </div>
      </div>
    );
  }

  // Sticker - Circle
  if (materialType === "sticker") {
    return (
      <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
        <div
          className="w-[85%] aspect-square rounded-full shadow-lg overflow-hidden"
          style={bgStyle}
        >
          <Content scale={0.9} />
        </div>
      </div>
    );
  }

  // Card - Business card ratio
  if (materialType === "card") {
    return (
      <div className="w-full aspect-[1.6/1] flex items-center justify-center bg-gray-100 rounded-lg p-3">
        <div
          className="w-full h-full shadow-lg rounded-md overflow-hidden"
          style={bgStyle}
        >
          <Content scale={0.7} />
        </div>
      </div>
    );
  }

  // Poster - A4 full
  if (materialType === "poster") {
    return (
      <div
        className="w-full aspect-[3/4] shadow-lg rounded-lg overflow-hidden"
        style={bgStyle}
      >
        <Content scale={1.2} />
      </div>
    );
  }

  return <div className="p-4 text-center text-muted-foreground">Выберите формат</div>;
};
