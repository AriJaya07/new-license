import { useEffect } from "react";
import { Alert } from "@/src/common/UI/Alert";
import { Wallet, Image, ShieldCheck, Tag, Loader2, Check } from "lucide-react";

// Toast Notification Component
export interface ToastProps {
  show: boolean;
  type: "success" | "error" | "info" | "";
  title: string;
  message: string;
  onClose: () => void;
}

export interface StepIndicatorProps {
  currentStep: number;
}

export const Toast = ({ show, type, title, message, onClose }: ToastProps) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300 ${
        !show ? "animate-out slide-out-to-top-2 fade-out" : ""
      }`}
    >
      <Alert type={type} title={title} message={message} className="my-4" />
    </div>
  );
};

const steps = [
  { id: 1, label: "Connect", icon: <Wallet /> },
  { id: 2, label: "Select NFT", icon: <Image /> },
  { id: 3, label: "Approve", icon: <ShieldCheck /> },
  { id: 4, label: "List", icon: <Tag /> },
];

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const totalSteps = steps.length;
  const progress =
    totalSteps > 1
      ? Math.min(100, Math.max(0, ((currentStep - 1) / (totalSteps - 1)) * 100))
      : 0;

  return (
    <div className="mb-8 rounded-2xl border bg-white/70 p-4 md:p-6 shadow-sm backdrop-blur">
      <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {steps.map((item, index) => {
          const step = index + 1;
          const active = currentStep >= step;
          const current = currentStep === step;

          return (
            <div key={step} className="flex flex-col items-center text-center">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition
                ${
                  active
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-muted text-muted-foreground"
                }
                ${current ? "ring-2 ring-indigo-300 ring-offset-2 ring-offset-white" : ""}`}
                aria-current={current ? "step" : undefined}
              >
                {currentStep > step ? <Check size={18} /> : item.icon}
              </div>

              <p
                className={`text-xs mt-2 font-medium ${
                  active ? "text-indigo-600" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
