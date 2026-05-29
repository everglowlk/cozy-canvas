import QRCode from "qrcode";

export interface QRPayload {
  e: string;
  t: string;
  n: string;
  g: number;
  id: string;
  v?: string;
}

/**
 * Build QR payload for a registration
 */
export function buildQRPayload(
  ticket: string,
  name: string,
  guests: number,
  regId: string
): QRPayload {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    e: "THE COZY CANVAS",
    t: ticket,
    n: name,
    g: guests,
    id: regId,
    v: `${appUrl}/api/verify/${ticket}`,
  };
}

/**
 * Generate a QR code as a base64 data URL (PNG)
 */
export async function generateQRDataUrl(payload: QRPayload): Promise<string> {
  const text = JSON.stringify(payload);
  const dataUrl = await QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    width: 300,
    margin: 2,
    color: {
      dark: "#06100d",
      light: "#f5fff9",
    },
  });
  return dataUrl;
}

/**
 * Generate QR as SVG string
 */
export async function generateQRSvg(payload: QRPayload): Promise<string> {
  const text = JSON.stringify(payload);
  const svg = await QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: {
      dark: "#06100d",
      light: "#f5fff9",
    },
  });
  return svg;
}
