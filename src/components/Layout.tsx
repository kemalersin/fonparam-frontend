import { Link, useLocation } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import ScrollToTopButton from './ScrollToTopButton';
import ThemeToggle from './ThemeToggle';

const navigation = [
    { name: 'Fonlar', href: '/funds' },
    { name: 'Şirketler', href: '/companies' },
    { name: 'Karşılaştır', href: '/compare' },
    { name: 'Favoriler', href: '/favorites' },    
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    return (
        <div className="min-h-screen flex flex-col">
            <Disclosure as="nav" className="bg-white dark:bg-gray-800 shadow-sm">
                {({ open }) => (
                    <>
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 justify-between">
                                <div className="flex">
                                    <div className="flex flex-shrink-0 items-center">
                                        <Link to="/" className="-m-1.5 p-1.5">
                                            <span className="sr-only">FonParam</span>
                                            <img
                                                className="h-6 w-auto"
                                                src="/logo.png"
                                                alt="FonParam"
                                            />
                                        </Link>
                                    </div>
                                    <div className="hidden sm:ml-12 sm:flex sm:space-x-8">
                                        {navigation.map((item) => (
                                            <Link
                                                key={item.href}
                                                to={item.href}
                                                className={classNames(
                                                    location.pathname === item.href
                                                        ? 'border-indigo-500 text-gray-900 dark:text-gray-100'
                                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300',
                                                    'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                                                )}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <ThemeToggle />
                                    <div className="-mr-2 flex items-center sm:hidden">
                                        <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-800 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                            <span className="sr-only">Ana menüyü aç</span>
                                            {open ? (
                                                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                            ) : (
                                                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                            )}
                                        </Disclosure.Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Disclosure.Panel className="sm:hidden">
                            <div className="space-y-1 pb-3 pt-2">
                                {navigation.map((item) => (
                                    <Disclosure.Button
                                        key={item.href}
                                        as={Link}
                                        to={item.href}
                                        className={classNames(
                                            location.pathname === item.href
                                                ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                                                : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-800 dark:hover:text-gray-100',
                                            'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                                        )}
                                    >
                                        {item.name}
                                    </Disclosure.Button>
                                ))}
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>

            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                    {children}
                </div>
            </main>
            <ScrollToTopButton />
        </div>
    );
} 