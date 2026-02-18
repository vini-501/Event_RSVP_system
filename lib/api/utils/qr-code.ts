export interface QrCodeData {
  ticketId: string;
  eventId: string;
  userId: string;
  timestamp: number;
  uniqueId: string;
}

export function generateQrCodeData(
  ticketId: string,
  eventId: string,
  userId: string
): QrCodeData {
  return {
    ticketId,
    eventId,
    userId,
    timestamp: Date.now(),
    uniqueId: `${ticketId}-${Date.now()}`,
  };
}

export function encodeQrCodeData(data: QrCodeData): string {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

export function decodeQrCodeData(encoded: string): QrCodeData {
  try {
    return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'));
  } catch (error) {
    throw new Error('Invalid QR code data');
  }
}

export function isQrCodeValid(data: QrCodeData, maxAgeMs: number = 24 * 60 * 60 * 1000): boolean {
  const ageMs = Date.now() - data.timestamp;
  return ageMs <= maxAgeMs;
}
