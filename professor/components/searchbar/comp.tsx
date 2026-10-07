"use client"

import { useRouter, usePathname } from "next/navigation"; 
import { useEffect, useId, useState } from "react"; 
import type { Suggestion } from "@/helpers/search/suggest";
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
    const t = useDictionary();
    const [searchValue, setSearchValue] = useState(defaultValue);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loadedFor, setLoadedFor] = useState("");
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const listId = useId();

    // fetch matches a moment after the user stops typing; a newer keystroke cancels the older request
    useEffect(() => {
        const q = searchValue.trim();
        if (q.length < 2) {
            setSuggestions([]);
            setLoadedFor("");
            return;
        }
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search/suggest?type=${searchType}&q=${encodeURIComponent(q)}`, { signal: controller.signal });
                const data = res.ok ? await res.json() : [];
                setSuggestions(Array.isArray(data) ? data : []);
                setLoadedFor(q);
                setActive(-1);
            } catch {
                // aborted by a newer keystroke, or offline; keep what is shown
            }
        }, 200);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [searchValue, searchType]);

    const handleChange = (e : any) => {
        setSearchValue(e.target.value); 
        setOpen(true);
    }; 

    const handleSearch = () => {
        if(searchValue.trim()){
            const value = `/search/${searchType}?q=${encodeURIComponent(searchValue.trim())}`;
            router.push(value); 
            
        }

    }; 

    const goTo = (suggestion: Suggestion) => {
        setOpen(false);
        router.push(suggestion.href);
    };

    const handleKeyDown = (e : React.KeyboardEvent<HTMLInputElement>) => {
        const showing = open && suggestions.length > 0;
        if (e.key === "ArrowDown" && showing) {
            e.preventDefault();
            setActive((i) => (i + 1) % suggestions.length);
        } else if (e.key === "ArrowUp" && showing) {
            e.preventDefault();
            setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        } else if (e.key === "Escape") {
            setOpen(false);
        } else if (e.key === "Enter") {
            if (showing && active >= 0) return goTo(suggestions[active]);
            return handleSearch();
        }
    }; 

    const sizeClasses = {
        small: 'px-2 py-1 text-sm',
        medium: 'px-4 py-2 text-base', // Default size
        large: 'px-6 py-3 text-lg',
    };

    const q = searchValue.trim();
    const showList = open && q.length >= 2 && loadedFor === q;

    return(
        <div className="flex space-x-4 ">
            <div className="relative">
                <input
                type = "text"
                value = {searchValue}
                onChange = {handleChange}
                onKeyDown = {handleKeyDown}
                onFocus = {() => setOpen(true)}
                onBlur = {() => setOpen(false)}
                placeholder = {placeholder}
                role = "combobox"
                aria-expanded = {showList}
                aria-controls = {listId}
                aria-autocomplete = "list"
                aria-activedescendant = {showList && active >= 0 ? `${listId}-${active}` : undefined}
                autoComplete = "off"
                className = {`border border-gray-300 rounded-lg w-full ${sizeClasses[size]}`}
                />
                {showList && (
                    <ul id={listId} role="listbox" className="absolute left-0 right-0 z-20 mt-1 min-w-[16rem] max-h-80 overflow-auto rounded-lg border border-gray-200 bg-white text-left text-black shadow-lg">
                        {suggestions.length === 0 && (
                            <li className="px-3 py-2 text-sm text-gray-500">{t.searchNoSuggestions}</li>
                        )}
                        {suggestions.map((s, i) => (
                            <li
                            key = {s.href}
                            id = {`${listId}-${i}`}
                            role = "option"
                            aria-selected = {i === active}
                            // mousedown fires before the input's blur, which would close the list first
                            onMouseDown = {(e) => { e.preventDefault(); goTo(s); }}
                            onMouseEnter = {() => setActive(i)}
                            className = {`cursor-pointer px-3 py-2 ${i === active ? 'bg-blue-50' : ''}`}
                            >
                                <div className="text-sm font-medium">{s.label}</div>
                                <div className="text-xs text-gray-500">{s.detail}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
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