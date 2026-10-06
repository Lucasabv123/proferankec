"use client"

import { useRouter, usePathname } from "next/navigation"; 
import { useState } from "react"; 
import { useDictionary } from "@/components/i18n/provider";

interface SearchBarAddOnPrimitiveProps {
    defaultValue?: string;
    searchTypeOptions?: string[];
    placeholder?: string;
    buttonText?: string;
}
interface SearchBarPrimitiveProps {
    defaultValue?: string;
    searchType?: string;
    placeholder?: string;
    buttonText?: string;
    size?: "small" | "medium" | "large";
}

interface SearchBarProps {
    type?: 'course' | 'professor' | 'school';
    size?: 'small' | 'medium' | 'large';
    onPage?: boolean;
    placeholder?: string;
}


export const SearchBarAddOnPrimitive : React.FC<SearchBarAddOnPrimitiveProps> = ({ defaultValue = '', searchTypeOptions = ['course', 'professor'], placeholder = 'Search...', buttonText = 'Search'}) => {
    const router = useRouter(); 
    const pathname = usePathname();
    const [searchValue, setSearchValue] = useState(defaultValue);
    const [searchType, setSearchType] = useState(searchTypeOptions[0]); // Default to the first search type
    const t = useDictionary();
    const typeLabels: Record<string, string> = { course: t.searchTypeCourse, professor: t.searchTypeProfessor };

    const handleChange = (e : any) => {
        const inputValue = e.target.value; 
        setSearchValue(inputValue); 
    };

    const handleSearchTypeChange = (e : any) => {
        setSearchType(e.target.value);
    };

    const handleSearch = () => {
        const params = new URLSearchParams(window.location.search);

        if (searchValue) {
            params.set('q', searchValue.trim());
        } else {
            params.delete('q');
        }

        // Add or update the searchType parameter
        if (searchType) {
            params.set('type', searchType);
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    const handleKeyPress = (e : any) => {
        if (e.key === "Enter") return handleSearch();
    };

    return (
        <div className="flex space-x-4 md:flex-row flex-col justify-center items-center gap-2">
            <select 
                value={searchType} 
                onChange={handleSearchTypeChange} 
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
            >
                {searchTypeOptions.map(type => (
                    <option key={type} value={type}>{typeLabels[type] ?? type}</option>
                ))}
            </select>
            <input
                type="text"
                value={searchValue}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
            />
            <button 
                onClick={handleSearch} 
                className="bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 px-4"
            >
                {buttonText}
            </button>
        </div>
    );
};




export const SearchBarPrimitive: React.FC<SearchBarPrimitiveProps> = ({ defaultValue = '', searchType = 'course', placeholder = 'Search...', buttonText = 'Search', size="medium"}) =>{
    const router = useRouter(); 
    const [searchValue, setSearchValue] = useState(defaultValue);

    const handleChange = (e : any) => {
        const inputValue = e.target.value; 
        setSearchValue(inputValue); 
    }; 

    const handleSearch = () => {
        if(searchValue.trim()){
            const value = `/search/${searchType}?q=${encodeURIComponent(searchValue.trim())}`;
            router.push(value); 
            
        }

    }; 

    const handleKeyPress = (e : any) => {
        if(e.key == "Enter") return handleSearch(); 
    }; 

    const sizeClasses = {
        small: 'px-2 py-1 text-sm',
        medium: 'px-4 py-2 text-base', // Default size
        large: 'px-6 py-3 text-lg',
    };

    return(
        <div className="flex space-x-4 ">
            <input
            type = "text"
            value = {searchValue}
            onChange = {handleChange}
            onKeyPress = {handleKeyPress}
            placeholder = {placeholder}
            className = {`border border-gray-300 rounded-lg ${sizeClasses[size]}`}
            />
            <button onClick = {handleSearch} className={`bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 ${sizeClasses[size]}`}>
                {buttonText}
            </button>

        </div>
    ); 
 
}; 

const SearchBar : React.FC<SearchBarProps> = ({ type = "course", size = "medium", onPage = false, placeholder}) => {
    const t = useDictionary();
    if(type == "course") return <SearchBarPrimitive searchType="course" placeholder={onPage && placeholder ? placeholder : t.searchCoursesPlaceholder} buttonText={t.searchCoursesButton} size={size} />;
    if(type == "professor") return <SearchBarPrimitive searchType="professor" placeholder={onPage && placeholder ? placeholder : t.searchProfessorsPlaceholder} buttonText={t.searchProfessorsButton} size={size} />;
    if(type == "school") return <SearchBarPrimitive searchType="school" placeholder={onPage && placeholder ? placeholder : t.searchSchoolsPlaceholder} buttonText={t.searchSchoolsButton} size={size} />;
    return null;  
}; 


export default SearchBar; 