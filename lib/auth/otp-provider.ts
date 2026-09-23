/**
 * OTP delivery is abstracted behind this interface so a real SMS provider
 * (MSG91, Twilio, Gupshup, etc.) can be plugged in later without touching
 * the OTP issuing/verification logic in lib/auth/otp.ts.
 */
export interface OtpProvider {
  send(phone: string, code: string): Promise<void>;
}

/**
 * Default MVP provider: no SMS is actually sent. The code is logged on the
 * server so it's visible during local development/testing.
 */
class MockOtpProvider implements OtpProvider {
  async send(phone: string, code: string): Promise<void> {
    console.log(`[mock-otp] ${phone} -> ${code}`);
  }
}

/**
 * Placeholder for a future real provider. Wire up an SMS API here and
 * flip OTP_PROVIDER in the environment — nothing else in the app needs
 * to change since callers only depend on the OtpProvider interface.
 */
class UnconfiguredOtpProvider implements OtpProvider {
  constructor(private readonly providerName: string) {}

  async send(): Promise<void> {
    throw new Error(
      `OTP provider "${this.providerName}" is not implemented yet. Set OTP_PROVIDER=mock for local development.`,
    );
  }
}

let cachedProvider: OtpProvider | undefined;

export function getOtpProvider(): OtpProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = process.env.OTP_PROVIDER ?? "mock";
  cachedProvider =
    providerName === "mock"
      ? new MockOtpProvider()
      : new UnconfiguredOtpProvider(providerName);

  return cachedProvider;
}

export function isMockOtpProvider(): boolean {
  return (process.env.OTP_PROVIDER ?? "mock") === "mock";
}
