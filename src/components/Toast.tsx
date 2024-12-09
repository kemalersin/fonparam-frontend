import { Fragment, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    show: boolean;
    type?: ToastType;
    message: string;
    onClose: () => void;
}

const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
};

const colors = {
    success: {
        text: 'text-green-600',
        bg: 'bg-green-50',
        ring: 'ring-green-600/10'
    },
    error: {
        text: 'text-red-600',
        bg: 'bg-red-50',
        ring: 'ring-red-600/10'
    },
    warning: {
        text: 'text-yellow-600',
        bg: 'bg-yellow-50',
        ring: 'ring-yellow-600/10'
    },
    info: {
        text: 'text-blue-600',
        bg: 'bg-blue-50',
        ring: 'ring-blue-600/10'
    }
};

export default function Toast({ show, type = 'info', message, onClose }: ToastProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    const Icon = icons[type];
    const color = colors[type];

    return (
        <div
            aria-live="assertive"
            className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50"
        >
            <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                <Transition
                    show={show}
                    as={Fragment}
                    enter="transform ease-out duration-300 transition"
                    enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                    enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className={`pointer-events-auto w-full max-w-md overflow-hidden rounded-lg ${color.bg} shadow-lg ring-1 ${color.ring}`}>
                        <div className="p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Icon className={`h-5 w-5 ${color.text}`} aria-hidden="true" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className={`text-sm font-medium ${color.text} break-words`}>{message}</p>
                                </div>
                                <div className="ml-4 flex flex-shrink-0">
                                    <button
                                        type="button"
                                        className={`inline-flex rounded-md ${color.bg} ${color.text} hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Kapat</span>
                                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
    );
} 