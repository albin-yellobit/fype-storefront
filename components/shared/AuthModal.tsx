"use client";

// Shared across all themes, not per-theme — sign-in is one consistent flow
// regardless of which theme a store is running (same reasoning as checkout).

import { useState, useEffect } from "react";
import Link from "next/link";
import OtpInput from "react-otp-input";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { sendOTP, verifyOTP, completeRegistration, clearAuthError, getPlatform } from "@/redux/slices/userSlice";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeId?: string;
    shopName?: string;
    platformName?: string;
}

interface RegistrationData {
    firstName: string;
    email: string;
    phone?: string;
}

type Channel = "email" | "whatsapp" | "sms";

const CHANNEL_META: Record<string, { label: string; icon: string; description: string }> = {
    email: { label: "Email", icon: "email", description: "Receive OTP on your email address" },
    whatsapp: { label: "WhatsApp", icon: "chat", description: "Receive OTP via WhatsApp message" },
    sms: { label: "SMS", icon: "sms", description: "Receive OTP via text message" },
};

export default function AuthModal({ isOpen, onClose, storeId, shopName = "Store" }: AuthModalProps) {
    const dispatch = useAppDispatch();
    const { authLoading, authError, isAuthenticated, user, authChannels } = useAppSelector((state) => state.user);

    const [step, setStep] = useState<"channel" | "identifier" | "otp" | "register">("identifier");
    const [selectedChannel, setSelectedChannel] = useState<Channel>("email");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [otp, setOtp] = useState("");
    const [localError, setLocalError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
    const [email, setEmail] = useState("");
    const [registrationData, setRegistrationData] = useState<RegistrationData>({ firstName: "", email: "", phone: "" });

    const isEmailChannel = selectedChannel === "email";
    const multipleChannels = authChannels.length > 1;

    const handleSuccessfulAuth = () => {
        setStep(multipleChannels ? "channel" : "identifier");
        setPhoneNumber("");
        setOtp("");
        setLocalError("");
        setRegistrationData({ firstName: "", email: "", phone: "" });
        setEmail("");
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            dispatch(clearAuthError());
            if (storeId) dispatch(getPlatform({ storeId }));
        }
    }, [isOpen, dispatch, storeId]);

    // Derive the initial channel/step from the loaded auth channels — adjusted
    // during render (comparing against the previous value) rather than in an
    // effect, same reasoning as the isOpen reset below.
    const [prevAuthChannels, setPrevAuthChannels] = useState(authChannels);
    if (authChannels !== prevAuthChannels) {
        setPrevAuthChannels(authChannels);
        if (authChannels.length > 0) {
            setSelectedChannel(authChannels[0] as Channel);
            setStep(authChannels.length > 1 ? "channel" : "identifier");
        }
    }

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Calls the onClose prop (an external callback, not just local state), so
    // this stays a genuine effect rather than the render-time-adjustment
    // pattern used elsewhere in this file.
    useEffect(() => {
        if (isAuthenticated && isOpen && user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (user.requiresRegistration) setStep("register");
            else handleSuccessfulAuth();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user, isOpen]);

    // Reset local UI state when the modal closes — adjusted during render
    // (comparing against the previous isOpen) rather than in an effect, same
    // reasoning as ProductGallery's selectedImage reset.
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (!isOpen) {
            setStep(multipleChannels ? "channel" : "identifier");
            setPhoneNumber("");
            setOtp("");
            setLocalError("");
            setResendCooldown(0);
            setAttemptsLeft(null);
            setRegistrationData({ firstName: "", email: "", phone: "" });
            setEmail("");
        }
    }

    if (!isOpen) return null;

    const handleSelectChannel = (channel: Channel) => {
        setSelectedChannel(channel);
        setLocalError("");
        setStep("identifier");
    };

    const handleSendOTP = async () => {
        if (!storeId) return;
        const identifier = isEmailChannel ? email : phoneNumber;
        if (!identifier) {
            setLocalError(`Please enter a valid ${isEmailChannel ? "email address" : "phone number"}`);
            return;
        }
        if (isEmailChannel && !/\S+@\S+\.\S+/.test(email)) {
            setLocalError("Please enter a valid email address");
            return;
        }
        setLocalError("");
        try {
            const payload: { storeId: string; channel: Channel; email?: string; phoneNumber?: string } = {
                storeId,
                channel: selectedChannel,
            };
            if (isEmailChannel) payload.email = identifier;
            else payload.phoneNumber = identifier;

            const result = await dispatch(sendOTP(payload)).unwrap();
            setResendCooldown(30);
            setAttemptsLeft(result.attemptsLeft || 3);
            setStep("otp");
        } catch (err: unknown) {
            const message = typeof err === "string" ? err : "Failed to send OTP";
            setLocalError(message);
            if (message.includes("try again later")) setResendCooldown(60);
        }
    };

    const handleVerifyOTP = async () => {
        if (!storeId) return;
        if (otp.length !== 4) {
            setLocalError("Please enter complete 4-digit OTP");
            return;
        }
        setLocalError("");
        try {
            const identifier = isEmailChannel ? email : phoneNumber;
            const payload: { storeId: string; otp: string; channel: Channel; email?: string; phoneNumber?: string } = {
                storeId,
                otp,
                channel: selectedChannel,
            };
            if (isEmailChannel) payload.email = identifier;
            else payload.phoneNumber = identifier;
            await dispatch(verifyOTP(payload)).unwrap();
        } catch (err: unknown) {
            const message = typeof err === "string" ? err : "Invalid OTP";
            setLocalError(message);
            if (message.includes("attempts left")) {
                const match = message.match(/(\d+) attempts? left/);
                if (match) setAttemptsLeft(parseInt(match[1]));
            }
            setOtp("");
            if (message.includes("Maximum attempts exceeded") || message.includes("request a new OTP")) {
                setTimeout(() => {
                    setStep("identifier");
                    setOtp("");
                    setResendCooldown(300);
                }, 2000);
            }
        }
    };

    const handleCompleteRegistration = async () => {
        if (!storeId) return;
        if (!registrationData.firstName.trim()) {
            setLocalError("Name is required");
            return;
        }
        if (!isEmailChannel && !registrationData.email.trim()) {
            setLocalError("Email address is required");
            return;
        }
        if (!isEmailChannel && !/\S+@\S+\.\S+/.test(registrationData.email)) {
            setLocalError("Please enter a valid email address");
            return;
        }
        if (isEmailChannel && !registrationData.phone) {
            setLocalError("Phone number is required");
            return;
        }
        setLocalError("");
        try {
            const finalData = {
                firstName: registrationData.firstName,
                lastName: "",
                email: isEmailChannel ? email : registrationData.email,
                phone: isEmailChannel ? registrationData.phone : phoneNumber,
            };
            await dispatch(completeRegistration({ storeId, registrationData: finalData })).unwrap();
            handleSuccessfulAuth();
        } catch (err: unknown) {
            setLocalError(typeof err === "string" ? err : "Failed to complete registration");
        }
    };

    const handleResendOTP = async () => {
        if (resendCooldown > 0) return;
        setOtp("");
        setLocalError("");
        await handleSendOTP();
    };

    const displayError = localError || authError;

    return (
        <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="relative p-6 border-b border-gray-200">
                    {step !== "register" && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            disabled={authLoading}
                        >
                            <span className="material-symbols-outlined text-gray-500">close</span>
                        </button>
                    )}
                    {step !== "channel" && multipleChannels && step !== "register" && (
                        <button
                            onClick={() => setStep("channel")}
                            className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            disabled={authLoading}
                        >
                            <span className="material-symbols-outlined text-gray-500">arrow_back</span>
                        </button>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900">
                        {step === "register" ? "Complete Your Profile" : `Sign in to ${shopName}`}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {step === "channel"
                            ? "Choose how you want to receive your OTP"
                            : step === "register"
                              ? "Please provide your details"
                              : `via ${CHANNEL_META[selectedChannel]?.label ?? selectedChannel}`}
                    </p>
                </div>

                <div className="p-6">
                    {step === "channel" && (
                        <div className="space-y-3">
                            {authChannels.map((ch) => {
                                const meta = CHANNEL_META[ch];
                                if (!meta) return null;
                                return (
                                    <button
                                        key={ch}
                                        onClick={() => handleSelectChannel(ch as Channel)}
                                        className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center shrink-0 transition-colors">
                                            <span className="material-symbols-outlined text-gray-600 group-hover:text-blue-600">
                                                {meta.icon}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{meta.label}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{meta.description}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-300 group-hover:text-blue-400 ml-auto">
                                            chevron_right
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {step === "identifier" && (
                        <>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {isEmailChannel ? "Email Address" : "Phone Number"}
                                </label>
                                {isEmailChannel ? (
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={() => setLocalError("")}
                                        disabled={authLoading}
                                        placeholder="Enter your email address"
                                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <PhoneInput
                                        international
                                        defaultCountry="IN"
                                        value={phoneNumber}
                                        onChange={(value) => setPhoneNumber(value || "")}
                                        onBlur={() => setLocalError("")}
                                        disabled={authLoading}
                                        className="h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    You&apos;ll receive a 4-digit OTP via {CHANNEL_META[selectedChannel]?.label ?? selectedChannel}
                                </p>
                            </div>
                            {displayError && <ErrorBox message={displayError} />}
                            {resendCooldown > 0 && <CooldownBox seconds={resendCooldown} />}
                            <button
                                onClick={handleSendOTP}
                                disabled={authLoading || (isEmailChannel ? !email : !phoneNumber) || resendCooldown > 0}
                                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {authLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">send</span>
                                        Send OTP
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {step === "otp" && (
                        <>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Enter 4-digit OTP</label>
                                <p className="text-sm text-gray-500 mb-4">
                                    Sent to {isEmailChannel ? email : phoneNumber}
                                    <button
                                        onClick={() => {
                                            setStep("identifier");
                                            setOtp("");
                                            setLocalError("");
                                        }}
                                        className="ml-2 text-blue-600 hover:underline font-medium"
                                        disabled={authLoading}
                                    >
                                        Change
                                    </button>
                                </p>
                                <OtpInput
                                    value={otp}
                                    onChange={(value: string) => {
                                        setOtp(value);
                                        setLocalError("");
                                    }}
                                    numInputs={4}
                                    renderSeparator={<span className="mx-1" />}
                                    renderInput={(props) => (
                                        <input
                                            {...props}
                                            disabled={authLoading}
                                            className="!w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                        />
                                    )}
                                    containerStyle="flex justify-center"
                                    inputType="tel"
                                    shouldAutoFocus
                                />
                                {attemptsLeft !== null && attemptsLeft > 0 && (
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        {attemptsLeft} {attemptsLeft === 1 ? "attempt" : "attempts"} remaining
                                    </p>
                                )}
                            </div>
                            {displayError && <ErrorBox message={displayError} />}
                            <button
                                onClick={handleVerifyOTP}
                                disabled={authLoading || otp.length !== 4}
                                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-3 flex items-center justify-center gap-2"
                            >
                                {authLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">verified</span>
                                        Verify OTP
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleResendOTP}
                                disabled={authLoading || resendCooldown > 0}
                                className="w-full py-3 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                            </button>
                        </>
                    )}

                    {step === "register" && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={registrationData.firstName}
                                    onChange={(e) => setRegistrationData((prev) => ({ ...prev, firstName: e.target.value }))}
                                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your name"
                                    disabled={authLoading}
                                />
                            </div>
                            {isEmailChannel ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                    <PhoneInput
                                        international
                                        defaultCountry="IN"
                                        value={registrationData.phone}
                                        onChange={(value) => setRegistrationData((prev) => ({ ...prev, phone: value || "" }))}
                                        disabled={authLoading}
                                        className="h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        value={registrationData.email}
                                        onChange={(e) => setRegistrationData((prev) => ({ ...prev, email: e.target.value }))}
                                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter your email address"
                                        disabled={authLoading}
                                    />
                                </div>
                            )}
                            {displayError && <ErrorBox message={displayError} />}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setStep("otp");
                                        setLocalError("");
                                    }}
                                    disabled={authLoading}
                                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleCompleteRegistration}
                                    disabled={
                                        authLoading ||
                                        !registrationData.firstName.trim() ||
                                        (isEmailChannel ? !registrationData.phone : !registrationData.email.trim())
                                    }
                                    className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    {authLoading ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">check_circle</span>
                                            Complete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {(step === "identifier" || step === "otp") && (
                        <p className="text-xs text-gray-500 text-center mt-6">
                            By proceeding, I accept the{" "}
                            <Link href="/terms" className="text-blue-600 hover:underline">
                                T&amp;C
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-blue-600 hover:underline">
                                Privacy Policy
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function ErrorBox({ message }: { message: string }) {
    return (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <span className="material-symbols-outlined text-red-600 text-sm mt-0.5">error</span>
            <p className="text-sm text-red-600 flex-1">{message}</p>
        </div>
    );
}

function CooldownBox({ seconds }: { seconds: number }) {
    return (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-600 text-sm mt-0.5">schedule</span>
            <p className="text-sm text-amber-700">Please wait {seconds}s before requesting a new OTP</p>
        </div>
    );
}
