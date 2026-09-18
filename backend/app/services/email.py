import asyncio
import logging
from typing import Optional
import resend

from app.core.config import settings

logger = logging.getLogger(__name__)


def build_verification_email_html(code: str, full_name: Optional[str] = None) -> str:
    greeting = f"Hola, {full_name}" if full_name else "Hola"
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu cuenta en CocheraVecina</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F8FAFC;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background-color:#FFFFFF;border-radius:16px;border:1px solid #E2E8F0;box-shadow:0 4px 6px -1px rgba(15,23,42,0.05);overflow:hidden;">
          <!-- Header with Navy Accent -->
          <tr>
            <td style="background-color:#0F172A;padding:32px 32px 28px;text-align:center;">
              <div style="display:inline-block;margin-bottom:8px;">
                <span style="font-size:24px;font-weight:900;color:#FFFFFF;letter-spacing:-0.03em;">Cochera<span style="color:#2563EB;">Vecina</span></span>
                <span style="background-color:#2563EB;color:#FFFFFF;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;vertical-align:top;margin-left:4px;">MX</span>
              </div>
              <p style="margin:0;font-size:12px;color:#94A3B8;letter-spacing:0.02em;">Pensión y resguardo vehicular de confianza</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:36px 32px;">
              <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0F172A;letter-spacing:-0.02em;">
                Código de verificación de seguridad
              </h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:#475569;">
                {greeting}. Para proteger tu cuenta y tus reservaciones en CocheraVecina, utiliza el siguiente código único de 6 dígitos:
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color:#F8FAFC;border:1px solid #CBD5E1;border-radius:12px;padding:24px 16px;text-align:center;margin:0 0 24px;">
                <div style="font-family:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:36px;font-weight:800;letter-spacing:10px;color:#2563EB;padding-left:10px;">
                  {code}
                </div>
                <div style="margin-top:12px;font-size:12px;font-weight:600;color:#64748B;">
                  ⏱️ Válido durante los próximos 15 minutos
                </div>
              </div>

              <p style="margin:0 0 16px;font-size:13px;line-height:1.45;color:#64748B;">
                Si tú no solicitaste este código ni creaste una cuenta en CocheraVecina, puedes ignorar este mensaje de forma segura. Nadie puede acceder sin este código.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #E2E8F0;margin:0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#FAFAFA;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;color:#94A3B8;">
                CocheraVecina — Marketplace de estacionamiento y pensión vehicular en México.
              </p>
              <p style="margin:0;font-size:11px;color:#94A3B8;">
                patodev.com &bull; León &bull; Bajío &bull; CDMX
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


class EmailService:
    @staticmethod
    def send_verification_email_sync(email: str, code: str, full_name: Optional[str] = None) -> bool:
        """Synchronous sender method called via BackgroundTasks or worker."""
        if not settings.RESEND_API_KEY:
            logger.warning(
                f"[EmailService] RESEND_API_KEY not configured. OTP code for {email}: {code}"
            )
            return False

        resend.api_key = settings.RESEND_API_KEY

        html_content = build_verification_email_html(code=code, full_name=full_name)
        params: resend.Emails.SendParams = {
            "from": settings.EMAIL_FROM,
            "to": [email],
            "subject": f"{code} es tu código de verificación - CocheraVecina",
            "html": html_content,
        }

        try:
            response = resend.Emails.send(params)
            logger.info(f"[EmailService] Verification email sent to {email}. Response: {response}")
            return True
        except Exception as e:
            logger.error(f"[EmailService] Failed to send verification email to {email}: {e}")
            return False

    @classmethod
    async def send_verification_email(cls, email: str, code: str, full_name: Optional[str] = None) -> bool:
        """Asynchronous wrapper running resend synchronous call in a threadpool."""
        return await asyncio.to_thread(cls.send_verification_email_sync, email, code, full_name)
