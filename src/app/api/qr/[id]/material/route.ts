export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { generateQrDataUrl, buildTipUrl } from "@/lib/qr";
import { getMaterialById, getBackgroundStyles, getDimensions } from "@/lib/qr-materials";

/**
 * GET /api/qr/[id]/material - Download QR material in specified design
 * 
 * Query params:
 * - materialId: ID of the material design
 * - format: "png" or "pdf"
 * 
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get("materialId");
    const format = searchParams.get("format") || "png";

    if (!materialId) {
      return NextResponse.json(
        { error: "materialId is required" },
        { status: 400 }
      );
    }

    const material = getMaterialById(materialId);
    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Get QR code from database
    let shortCode = "demo123";
    
    try {
      const prisma = (await import("@/lib/prisma")).default;
      const qrCode = await prisma.qrCode.findUnique({
        where: { id },
      });
      if (qrCode) {
        shortCode = qrCode.shortCode;
      }
    } catch {
      // Use mock shortCode for development
    }

    const tipUrl = buildTipUrl(shortCode);
    const qrDataUrl = await generateQrDataUrl(tipUrl);
    const styles = getBackgroundStyles(material.backgroundColor);
    const dims = getDimensions(material.orientation);

    // Generate SVG for the material
    const isHorizontal = material.orientation === "horizontal";
    const svgWidth = dims.width;
    const svgHeight = dims.height;
    const qrSize = dims.qrSize;

    // Calculate positions
    const padding = 20;
    let qrX: number, qrY: number, textX: number, textY: number;
    
    if (isHorizontal) {
      qrX = padding;
      qrY = (svgHeight - qrSize) / 2;
      textX = qrSize + padding * 2;
      textY = svgHeight / 2 + 8;
    } else {
      qrX = (svgWidth - qrSize) / 2;
      qrY = padding;
      textX = svgWidth / 2;
      textY = qrSize + padding * 2 + 30;
    }

    // Create background gradient if needed
    let backgroundFill = styles.background;
    let gradientDef = "";
    
    if (material.backgroundColor === "gradient") {
      gradientDef = `
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0EA5E9;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#6366F1;stop-opacity:1" />
          </linearGradient>
        </defs>
      `;
      backgroundFill = "url(#grad)";
    }

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
        ${gradientDef}
        <rect width="100%" height="100%" fill="${backgroundFill}" rx="16"/>
        <image xlink:href="${qrDataUrl}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}"/>
        <text 
          x="${textX}" 
          y="${textY}" 
          fill="${styles.textColor}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="${isHorizontal ? 24 : 20}" 
          font-weight="600"
          ${isHorizontal ? '' : 'text-anchor="middle"'}
        >
          ${material.ctaText}
        </text>
      </svg>
    `;

    const svgBuffer = Buffer.from(svg);

    if (format === "png") {
      // Convert SVG to PNG using sharp
      const pngBuffer = await sharp(svgBuffer)
        .png()
        .toBuffer();

      return new NextResponse(new Uint8Array(pngBuffer), {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="qr-${shortCode}-${materialId}.png"`,
        },
      });
    }

    if (format === "pdf") {
      // For PDF, create a simple PDF with embedded PNG
      // Using a minimal PDF structure
      const pngBuffer = await sharp(svgBuffer)
        .png()
        .toBuffer();
      
      const pngBase64 = pngBuffer.toString("base64");
      const pngLength = pngBuffer.length;
      
      // Create minimal PDF with embedded image
      const pdf = createPdfWithImage(pngBase64, pngLength, svgWidth, svgHeight);
      
      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="qr-${shortCode}-${materialId}.pdf"`,
        },
      });
    }

    // Default: return SVG
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="qr-${shortCode}-${materialId}.svg"`,
      },
    });
  } catch (error) {
    console.error("Material download error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Create a minimal PDF with embedded PNG image
 */
function createPdfWithImage(pngBase64: string, pngLength: number, width: number, height: number): Buffer {
  // PDF dimensions (A4 or custom based on image)
  const pdfWidth = width;
  const pdfHeight = height;
  
  const pngData = Buffer.from(pngBase64, "base64");
  
  // Build PDF structure
  const objects: string[] = [];
  let objectCount = 0;
  
  const addObject = (content: string): number => {
    objectCount++;
    objects.push(content);
    return objectCount;
  };
  
  // Object 1: Catalog
  addObject(`1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj`);
  
  // Object 2: Pages
  addObject(`2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj`);
  
  // Object 3: Page
  addObject(`3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfWidth} ${pdfHeight}] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>
endobj`);
  
  // Object 4: Content stream (draw image)
  const contentStream = `q ${pdfWidth} 0 0 ${pdfHeight} 0 0 cm /Im0 Do Q`;
  addObject(`4 0 obj
<< /Length ${contentStream.length} >>
stream
${contentStream}
endstream
endobj`);
  
  // Object 5: Image XObject
  addObject(`5 0 obj
<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pngLength} >>
stream
${pngData.toString("binary")}
endstream
endobj`);
  
  // Build PDF
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + "\n";
  }
  
  // Cross-reference table
  const xrefOffset = pdf.length;
  pdf += "xref\n";
  pdf += `0 ${objectCount + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += offset.toString().padStart(10, "0") + " 00000 n \n";
  }
  
  // Trailer
  pdf += "trailer\n";
  pdf += `<< /Size ${objectCount + 1} /Root 1 0 R >>\n`;
  pdf += "startxref\n";
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF";
  
  return Buffer.from(pdf, "binary");
}
