"use client"

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"; 
import { useDictionary } from "@/components/i18n/provider";
import { professorName } from "@/helpers/links";

interface FilterProps {
    items: any[];
    itemId: string | number;
    totalItems?: number;
    type: string;
    param: string;
}

const Filter : React.FC<FilterProps> =  ({ items, itemId, totalItems, type = "course", param = "courseId" }) => {
    const t = useDictionary();
    const allLabel = type === "course" ? t.allCourses : t.allProfessors;
    const router = useRouter();
    const pathname = usePathname();
    const [selectedItem, setSelectedItem] = useState(itemId || '');

    const handleItemChange = (id) =>{
        setSelectedItem(id);  
        const params = new URLSearchParams(window.location.search);

        if(id){
            params.set(param, id);
        } else{
            params.delete(param);
        }
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="relative w-full sm:w-1/2">
            <Listbox value={selectedItem} onChange={handleItemChange}>
                <ListboxButton className="relative w-full cursor-default py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    {(() => {
                        const selected = items.find(item => item.id === selectedItem);

                        return selected ? (
                            type === "course" 
                            ? selected.name 
                            : professorName(selected)
                        ) : allLabel;
                    })()}
                </ListboxButton>

                <ListboxOptions className="absolute mt-2 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg z-10 sm:text-sm">
                    <ListboxOption value="" className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-300 transition-all">
                        {allLabel}
                    </ListboxOption>
                    {items.map((item) => (
                        <ListboxOption key={item.id} value={item.id} className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-300">
                            {type === "course" 
                            ? item.name 
                            : professorName(item)}
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </Listbox>
        </div>
    ); 
}

export default Filter;
