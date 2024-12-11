import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface SortHeaderProps {
    label: string;
    field: string;
    currentSort: string;
    currentOrder: 'ASC' | 'DESC';
    onSort: (field: string) => void;
}

export default function SortHeader({ 
    label, 
    field, 
    currentSort, 
    currentOrder, 
    onSort 
}: SortHeaderProps) {
    const isTextColumn = field === 'code' || field === 'title';
    return (
        <th
            scope="col"
            className={`whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer group ${
                field === 'code' ? 'w-24' : 
                field === 'title' ? 'w-48' : 
                'w-20'
            } ${isTextColumn ? 'text-left' : 'text-right'}`}
            onClick={() => onSort(field)}
        >
            <div className={`flex items-center gap-1 ${isTextColumn ? 'justify-start' : 'justify-end'}`}>
                <span>{label}</span>
                <span className="inline-flex flex-col">
                    {currentSort === field ? (
                        currentOrder === 'ASC' ? (
                            <ChevronUpIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                            <ChevronDownIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        )
                    ) : (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronUpIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </span>
                    )}
                </span>
            </div>
        </th>
    );
} 