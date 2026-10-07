"use client"

import { useRouter, usePathname } from "next/navigation"; 
import { useState } from "react"; 
import { useSuggestions, SuggestionList } from "@/components/searchbar/suggestions";
import { useDictionary } from "@/components/i18n/provider";

interface SearchBarAddOnPrimitiveProps {
    defaultValue?: string;
    searchTypeOptions?: string[];
    placeholder?: string;
    buttonText?: string;
    school?: string; // school key; suggestions only show that university's professors and courses
}
interface SearchBarPrimitiveProps {
    defaultValue?: string;
    searchType?: string;
    placeholder?: string;
    buttonText?: string;
    size?: "small" | "medium" | "large";
    listUnderParent?: boolean;
}

interface SearchBarProps {
    type?: 'course' | 'professor' | 'school';
    size?: 'small' | 'medium' | 'large';
    onPage?: boolean;
    placeholder?: string;
}


export const SearchBarAddOnPrimitive : React.FC<SearchBarAddOnPrimitiveProps> = ({ defaultValue = '', searchTypeOptions = ['course', 'professor'], placeholder = 'Search...', buttonText = 'Search', school}) => {
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

    const box = useSuggestions({ value: searchValue, searchType, school, onSearch: handleSearch });

    return (
        <div className="school-search">
            <select 
                aria-label={t.searchCategory}
                value={searchType} 
                onChange={handleSearchTypeChange} 
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
            >
                {searchTypeOptions.map(type => (
                    <option key={type} value={type}>{typeLabels[type] ?? type}</option>
                ))}
            </select>
            <div className="relative min-w-0 flex-1">
                <input
                    type="text"
                    aria-label={placeholder}
                    value={searchValue}
                    onChange={handleChange}
                    {...box.inputProps}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                />
                <SuggestionList box={box} />
            </div>
            <button 
                onClick={handleSearch} 
                className="bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 px-4"
            >
                {buttonText}
            </button>
        </div>
    );
};




export const SearchBarPrimitive: React.FC<SearchBarPrimitiveProps> = ({ defaultValue = '', searchType = 'course', placeholder = 'Search...', buttonText = 'Search', size="medium", listUnderParent = false}) =>{
    const router = useRouter(); 
    const [searchValue, setSearchValue] = useState(defaultValue);

    const handleChange = (e : any) => {
        setSearchValue(e.target.value); 
    }; 

    const handleSearch = () => {
        if(searchValue.trim()){
            const value = `/search/${searchType}?q=${encodeURIComponent(searchValue.trim())}`;
            router.push(value); 
            
        }

    }; 

    const box = useSuggestions({ value: searchValue, searchType, onSearch: handleSearch });

    const sizeClasses = {
        small: 'px-2 py-1 text-sm',
        medium: 'px-4 py-2 text-base', // Default size
        large: 'px-6 py-3 text-lg',
    };

    return(
        <div className={`search-control ${size === "medium" ? "search-control-medium" : ""}`}>
            <div className={`${listUnderParent ? "" : "relative"} min-w-0 flex-1`}>
                <input
                type = "search"
                aria-label = {buttonText}
                value = {searchValue}
                onChange = {handleChange}
                {...box.inputProps}
                placeholder = {placeholder}
                className = {`border border-gray-300 rounded-lg w-full ${sizeClasses[size]}`}
                />
                <SuggestionList box={box} className={listUnderParent ? "top-full" : ""} />
            </div>
            <button onClick = {handleSearch} aria-label={buttonText} className={`bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 ${sizeClasses[size]}`}>
                {size === "small" ? <><span className="sm:hidden"><i className="fas fa-search" aria-hidden="true" /></span><span className="hidden sm:inline">{buttonText}</span></> : buttonText}
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