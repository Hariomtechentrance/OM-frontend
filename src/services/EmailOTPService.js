// Demo-friendly Email OTP service.
// The UI expects:
// - getSetupInstructions(): { title, steps: string[], templateExample: string }
// - generateOTP(): string (6 digits)
// - sendOTP(destination: string, otp: string): Promise<{success:boolean,message?:string,demo?:boolean}>
// - verifyOTP(otp: string): {success:boolean,message?:string}
//
// This implementation runs in demo mode (no real email). It stores the last OTP
// generated in memory so verification works during the same session.

let lastGeneratedOtp = null;

const EmailOTPService = {
  getSetupInstructions() {
    return {
      title: 'Enable Real Email OTP (optional)',
      steps: [
        'Create SMTP credentials (or integrate an email provider) on your backend.',
        'Expose an API endpoint to send OTP: POST /api/auth/send-otp',
        'Expose an API endpoint to verify OTP: POST /api/auth/verify-otp',
        'Update this service to call those backend endpoints instead of demo mode.'
      ],
      templateExample: `Subject: Your OTP Code\n\nHi,\nYour one-time password is: {{OTP}}\n\nThis code expires in 10 minutes.`
    };
  },

  generateOTP() {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    lastGeneratedOtp = otp;
    return otp;
  },

  async sendOTP(destination, otp) {
    // Demo mode: just log OTP to console.
    // Keep shape compatible with UI.
    // eslint-disable-next-line no-console
    console.log(`[EmailOTPService] Demo OTP for ${destination}: ${otp}`);

    lastGeneratedOtp = otp;
    return {
      success: true,
      message: 'OTP generated in demo mode',
      demo: true
    };
  },

  verifyOTP(enteredOtp) {
    if (!lastGeneratedOtp) {
      return { success: false, message: 'OTP not generated yet.' };
    }

    if (String(enteredOtp) !== String(lastGeneratedOtp)) {
      return { success: false, message: 'Invalid OTP. Please try again.' };
    }

    // Invalidate after success
    lastGeneratedOtp = null;
    return { success: true };
  }
};

export default EmailOTPService;

