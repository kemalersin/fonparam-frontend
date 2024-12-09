import { useState, useEffect } from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';

export default function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    // Scroll pozisyonunu kontrol et
    useEffect(() => {
        const toggleVisibility = () => {
            // 500px'den fazla scroll yapıldığında butonu göster
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <Transition
            show={isVisible}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <button
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-110 transform transition-all duration-300 z-50"
                aria-label="Yukarı çık"
            >
                <ChevronUpIcon className="h-6 w-6" />
            </button>
        </Transition>
    );
} 