interface GradientBackgroundProps {
    children: React.ReactNode;
    className?: string;
}

export default function GradientBackground({ children, className = '' }: GradientBackgroundProps) {
    return (
        <div className={`relative isolate ${className}`}>
            {/* Top gradient */}
            <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-200 to-indigo-400 opacity-30 dark:from-indigo-700 dark:to-indigo-900 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
            </div>

            {/* Content */}
            {children}

            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
                <div className="relative left-[calc(50%+11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-200 to-indigo-400 opacity-30 dark:from-indigo-700 dark:to-indigo-900 sm:left-[calc(50%+30rem)] sm:w-[72.1875rem]"></div>
            </div>
        </div>
    );
} 