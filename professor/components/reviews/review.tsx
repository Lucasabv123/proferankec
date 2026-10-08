"use client";

import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Combobox, ComboboxButton, ComboboxOptions, ComboboxOption, ComboboxInput } from "@headlessui/react";
import ReviewFields, { EMPTY_DRAFT, ReviewDraft } from "./reviewFields";
import { FiChevronDown } from 'react-icons/fi';
import { useRouter } from "next/navigation";
import { useDictionary } from "@/components/i18n/provider";
import { format } from "@/helpers/i18n/dictionaries";
import { professorName } from "@/helpers/links";

interface ComboBoxProps {
    options: any[];
    setOption: (option: any) => void;
    type?: string;
}

interface ReviewProps {
    proco: any;
    session: any;
    userid: number;
    type?: string;
    buttonLabel?: string;
    buttonClassName?: string;
}

// Lukas Continue from this point
// You have to have this combobox work for professor and course choices now
const ComboBox : React.FC<ComboBoxProps> = ({ options, setOption, type = "professor" }) => {
  const t = useDictionary();
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [query, setQuery] = useState("");
 

   let filter; 
   if(type == "professor"){
      filter = query
      ? options.filter((option) => {
          const courseName = option.name ? option.name.toString().toLowerCase() : "";
          const queryString = query ? query.toString().toLowerCase() : "";
          return courseName.includes(queryString);
        })
      : options;

   }else {
      filter = query
      ? options.filter((option : any) => {
          const name = professorName(option).toLowerCase();
          const queryString = query ? query.toString().toLowerCase() : "";
          return name.includes(queryString);
        })
      : options;
   }

  
  const filtered = filter; 

  const handleSelect = (option) => {
    setSelectedOption(option);
    setOption(option);
  };

  return (
    <>
      <Combobox value={selectedOption} onChange={handleSelect}>
      <div className="relative">
        <ComboboxInput
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          displayValue={(option : any) => { if(!option) return ""; return type == "professor" ? option.name : professorName(option); }} 
          onChange={(e) => setQuery(e.target.value)}
          placeholder={type == "professor" ? t.searchCourseOption : t.searchProfessorOption}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
          <FiChevronDown className="w-5 h-5 text-gray-400" />
        </ComboboxButton>
      </div>
      <ComboboxOptions anchor="bottom start" className="z-[60] mt-1 w-[var(--input-width)] bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
        {filtered.length === 0 ? (
          <div className="p-2 text-gray-500">{type == 'professor' ? t.noCoursesFound : t.noProfessorsFound}</div>
        ) : (
          filtered.map((option) => (
            <ComboboxOption
              key={option.id}
              value={option}
              className={({ active }) =>
                `cursor-pointer select-none p-2 ${
                  active ? 'bg-blue-500 text-white' : 'text-gray-900'
                }`
              }
            >
              {type == "professor" ? option.name : professorName(option)}
            </ComboboxOption>
          ))
        )}
      </ComboboxOptions>
    </Combobox> 
    </>
  );
};

const Review : React.FC<ReviewProps> = ({ proco , session, userid, type = "professor", buttonLabel, buttonClassName }) => {
  const t = useDictionary();
  


  let info; 
  let alt; 

  
  if(type == "professor"){
    info = proco.courses.map(({ course }) => course);
    alt = professorName(proco); 
    

    
  } else{
    info = proco.professors.map(({ professor }) => professor);
    alt = `${proco.name}`;
  }

 
  const others = info // professor.courses if professor and courses.professor if courses
  const identifer = alt; 

  


  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const [draft, setDraft] = useState<ReviewDraft>(EMPTY_DRAFT);
  const [other, setOther] = useState(others[0]); // Default to the first item initially


  const handleSubmit = async (e : any) => {
    e.preventDefault();
    

    if (session == null) {
      alert(t.errSignIn);
      return;
    }

    

    let courseId; 
    let professorId;
    if(type == "professor"){
      courseId = other.id;
      professorId = proco.id;
    }else{
      courseId = proco.id;
      professorId = other.id;
    }

    const review = {
      professorId: professorId,
      courseId: courseId,
      ...draft
    };


    const res = await fetch("/api/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(review)
    });

    if (res.ok) {
      const data = await res.json();
      router.refresh(); 

      setIsOpen(false);
      setDraft(EMPTY_DRAFT);
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? t.reviewFailed);
    }
  };

  if (session == null) {
    return <p className="text-gray-600">{t.signInToReview}</p>;
  }

  return (
    <>
    <button 
      onClick={() => setIsOpen(true)} 
      // a custom label is the "Rank" button, which stays the same word in every language
      translate={buttonLabel ? "no" : undefined}
      className={(buttonLabel ? "notranslate " : "") + (buttonClassName ?? "bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600 transition duration-200 ease-in-out")}
    >
      {buttonLabel ?? t.leaveReview}
    </button>
  
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold text-gray-800 mb-4">
            {format(t.leaveReviewFor, { name: identifer })}
          </DialogTitle>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h1 className="text-gray-700 font-semibold mb-2">{type === 'course' ? t.whichProfessor : t.whichCourse}</h1>
              <ComboBox options={others} setOption={setOther} type = {type} />
            </div>
            
            <ReviewFields value={draft} onChange={setDraft} />

            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600 transition duration-200 ease-in-out w-full"
            >
              {t.submitReview}
            </button>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  </>
  );
};

export default Review;
