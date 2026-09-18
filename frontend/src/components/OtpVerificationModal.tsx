"use client";

import React, { useState, useEffect, useRef } from "react";
import { api, User } from "@/lib/api";
import { X, Mail, CheckCircle2, ShieldCheck, RefreshCw, ArrowRight } from "lucide-react";

interface OtpVerificationModalProps {
  isOpen: boolean;
  email: string;
  token?: string;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export default function OtpVerificationModal({
  isOpen,
  email,
  token,
  onClose,
  onSuccess,
}: OtpVerificationModalProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      setDigits(["", "", "", "", "", ""]);
      setError(null);
      setResendSuccess(null);
      setCountdown(60);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // 60-second cooldown timer for resending OTP
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const currentToken = token || (typeof window !== "undefined" ? localStorage.getItem("cochera_token") || "" : "");

  const handleDigitChange = (index: number, value: string) => {
    setError(null);
    const cleaned = value.replace(/\D/g, "");

    // If typing a single digit
    if (cleaned.length <= 1) {
      const newDigits = [...digits];
      newDigits[index] = cleaned;
      setDigits(newDigits);

      // Auto-advance to next input
      if (cleaned && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // If all 6 digits are complete, trigger submission
      if (cleaned && index === 5 && newDigits.every((d) => d !== "")) {
        submitOtp(newDigits.join(""));
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move to previous box if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setDigits(newDigits);

    // Focus on the next empty index or the last filled
    const nextEmptyIndex = newDigits.findIndex((d) => d === "");
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
      submitOtp(pasted);
    }
  };

  const submitOtp = async (codeToSubmit?: string) => {
    const code = codeToSubmit || digits.join("");
    if (code.length !== 6) {
      setError("Por favor ingresa el código completo de 6 dígitos.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedUser = await api.auth.verifyEmailCode(currentToken, code, email);
      onSuccess(updatedUser);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al verificar el código.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError(null);
    setResendSuccess(null);

    try {
      await api.auth.resendEmailCode(currentToken, email);
      setResendSuccess("Nuevo código enviado a tu bandeja de entrada.");
      setCountdown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "No se pudo reenviar el código. Intenta nuevamente.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon & Heading */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
              Verifica tu correo
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Seguridad para tus reservas en CocheraVecina
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-600 leading-relaxed">
          Enviamos un código de seguridad de 6 dígitos a{" "}
          <span className="font-bold text-slate-900">{email}</span>. Ingresa los números a continuación:
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200 font-medium">
            {error}
          </div>
        )}

        {/* Resend Success Alert */}
        {resendSuccess && (
          <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200 font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{resendSuccess}</span>
          </div>
        )}

        {/* 6 Individual Digit Inputs */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitOtp();
          }}
          className="mt-6"
        >
          <div className="flex justify-between gap-2 sm:gap-2.5">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                className="h-13 w-12 sm:h-14 sm:w-13 text-center font-mono text-2xl font-black text-slate-900 rounded-xl border-2 border-slate-200 bg-slate-50/60 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:outline-none transition-all"
                disabled={loading}
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || digits.some((d) => d === "")}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Verificando código...</span>
              </>
            ) : (
              <>
                <span>Confirmar y activar cuenta</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend Cooldown Counter */}
        <div className="mt-5 text-center text-xs text-slate-500">
          {countdown > 0 ? (
            <p className="font-medium">
              Reenviar código en{" "}
              <span className="font-bold text-slate-800">{countdown}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
              <span>¿No recibiste el código? Reenviar</span>
            </button>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          El código vence en 15 minutos. Revisa tu carpeta de correo no deseado o spam.
        </p>
      </div>
    </div>
  );
}
