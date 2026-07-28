interface CheckoutStepsProps {
    currentStep: "address" | "review" | "payment";
}

const STEPS = [
    { id: "address", label: "Address", icon: "location_on" },
    { id: "review", label: "Review", icon: "fact_check" },
    { id: "payment", label: "Payment", icon: "payment" },
] as const;

export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

    return (
        <div className="flex items-center justify-between mb-8 max-w-xl mx-auto">
            {STEPS.map((step, index) => {
                const status = index < currentIndex ? "completed" : index === currentIndex ? "current" : "pending";

                return (
                    <div key={step.id} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                    status === "completed"
                                        ? "bg-green-500 text-white"
                                        : status === "current"
                                          ? "bg-black text-white ring-4 ring-gray-200"
                                          : "bg-gray-200 text-gray-500"
                                }`}
                            >
                                <span className="material-symbols-outlined">{status === "completed" ? "check" : step.icon}</span>
                            </div>
                            <p className={`mt-2 text-xs font-semibold ${status === "current" ? "text-black" : "text-gray-500"}`}>{step.label}</p>
                        </div>

                        {index < STEPS.length - 1 && (
                            <div className={`flex-1 h-1 mx-4 rounded-full ${index < currentIndex ? "bg-green-500" : "bg-gray-200"}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
