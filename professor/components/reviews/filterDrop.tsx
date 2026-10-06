"use client"

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"; 

interface FilterProps {
    items: any[];
    itemId: string;
    totalItems?: number;
    type: string;
    param: string;
}

const Filter : React.FC<FilterProps> =  ({ items, itemId, totalItems, type = "course", param = "courseId" }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [selectedItem, setSelectedItem] = useState(itemId || '');
    console.log('item: ' + selectedItem); 

    const handleItemChange = (id) =>{
        setSelectedItem(id);  
        const params = new URLSearchParams(window.location.search);
        console.log(items); 

        if(id){
            params.set(param, id);
        } else{
            params.delete(param);
        }
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <>
            <Listbox value={selectedItem} onChange={handleItemChange}>
                <ListboxButton className="relative w-1/3 cursor-default py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    {(() => {
                        const selected = items.find(item => item.id === selectedItem);

                        return selected ? (
                            type === "course" 
                            ? selected.name 
                            : `${selected.Prefix} ${selected.Firstname} ${selected.Lastname}`
                        ) : `All ${type}s`;
                    })()}
                </ListboxButton>

                <ListboxOptions className="mt-2 max-h-60 w-1/3 overflow-auto rounded-md bg-white shadow-lg z-10 sm:text-sm">
                    <ListboxOption value="" className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-300 transition-all">
                        All {type}s
                    </ListboxOption>
                    {items.map((item) => (
                        <ListboxOption key={item.id} value={item.id} className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-300">
                            {type === "course" 
                            ? item.name 
                            : `${item.Prefix} ${item.Firstname} ${item.Lastname}`}
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </Listbox>
        </>
    ); 
}

export default Filter;
