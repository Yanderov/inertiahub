import { authenticator } from "otplib";
import QRCode from "qrcode";

export function generateTwoFactorSecret(userEmail: string, appName = "InertiaHub") {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(userEmail, appName, secret);
  return { secret, otpauth };
}

export async function generateQrCodeDataUrl(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl, {
    margin: 2,
    width: 240,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}

export function verifyTwoFactorToken(token: string, secret: string): boolean {
  try {
    return authenticator.check(token, secret);
  } catch (error) {
    return false;
  }
}
