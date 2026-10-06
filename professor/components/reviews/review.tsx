"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle, Combobox, ComboboxButton, ComboboxOptions, ComboboxOption, ComboboxInput, Field, Label, Textarea } from "@headlessui/react";
import StarRating from "./rating";
import { FiChevronDown } from 'react-icons/fi';
import { useRouter } from "next/navigation";

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
}

// Lukas Continue from this point
// You have to have this combobox work for professor and course choices now
const ComboBox : React.FC<ComboBoxProps> = ({ options, setOption, type = "professor" }) => {
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
          const professorName = option.Prefix + " " + option.Firstname + " " + option.Lastname;
          const queryString = query ? query.toString().toLowerCase() : "";
          return professorName.includes(queryString);
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
          displayValue={(option : any) => { if(!option) return ""; return type == "professor" ? option.name : option.Prefix + " " + option.Firstname + " " + option.Lastname; }} 
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a course..."
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
          <FiChevronDown className="w-5 h-5 text-gray-400" />
        </ComboboxButton>
      </div>
      <ComboboxOptions className="absolute z-10 mt-1 w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
        {filtered.length === 0 ? (
          <div className="p-2 text-gray-500">No {type == 'professor' ? "course" : "professor"}s found</div>
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
              {type == "professor" ? option.name : option.Prefix  + " " + option.Firstname + " " + option.Lastname}
            </ComboboxOption>
          ))
        )}
      </ComboboxOptions>
    </Combobox> 
    </>
  );
};

const Review : React.FC<ReviewProps> = ({ proco , session, userid, type = "professor" }) => {
  


  let info; 
  let alt; 

  
  if(type == "professor"){
    info = proco.courses.map(({ course }) => course);
    alt = `${proco.Prefix} ${proco.Firstname} ${proco.Lastname}`; 
    

    
  } else{
    info = proco.professors.map(({ professor }) => professor);
    alt = `${proco.name}`;
  }

 
  const others = info // professor.courses if professor and courses.professor if courses
  const identifer = alt; 

  


  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [workload, setWorkload] = useState(0);
  const [lecture, setLecture] = useState(0);
  const [learning, setLearning] = useState(0);
  const [other, setOther] = useState(others[0]); // Default to the first item initially
  const [comment, setComment] = useState("");


  useEffect(() => {
    if (session == null) {
      alert("You must be signed in to leave a review");
      setIsOpen(false);
    }
  }, [session]);

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    

    if (session == null) {
      alert("You must be signed in to leave a review");
      return;
    }

    
    console.log(session.user);

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
      userId: userid,
      overallRating: rating,
      difficulty,
      workload,
      lecture,
      learning,
      comment
    };

    console.log('Submitting review:', review); // Log the review data for debugging

    const res = await fetch("/api/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(review)
    });

    if (res.ok) {
      const data = await res.json();
      console.log('Response data:', data); // Log the response data for debugging
      router.refresh(); 

      setIsOpen(false);
      setRating(0);
      setDifficulty(0);
      setWorkload(0);
      setLecture(0);
      setLearning(0);
      setComment("");
    } else {
      console.error("Failed to submit review");
      alert("Failed to submit review");
    }
  };

  return (
    <>
    <button 
      onClick={() => setIsOpen(true)} 
      className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600 transition duration-200 ease-in-out"
    >
      Leave a review
    </button>
  
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
          <DialogTitle className="text-xl font-semibold text-gray-800 mb-4">
            Leave a review for {identifer}
          </DialogTitle>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h1 className="text-gray-700 font-semibold mb-2">What {type === 'course' ? "professor" : "course"}</h1>
              <ComboBox options={others} setOption={setOther} type = {type} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <h1 className="text-gray-700 font-semibold mb-2">Difficulty</h1>
                <StarRating rating={difficulty} onRatingChange={setDifficulty} />
              </div>
  
              <div>
                <h1 className="text-gray-700 font-semibold mb-2">Workload</h1>
                <StarRating rating={workload} onRatingChange={setWorkload} />
              </div>
  
              <div>
                <h1 className="text-gray-700 font-semibold mb-2">Lecture Quality</h1>
                <StarRating rating={lecture} onRatingChange={setLecture} />
              </div>
  
              <div>
                <h1 className="text-gray-700 font-semibold mb-2">Learning Value</h1>
                <StarRating rating={learning} onRatingChange={setLearning} />
              </div>
  
              <div className="sm:col-span-2">
                <h1 className="text-gray-700 font-semibold mb-2">Overall Rating</h1>
                <StarRating rating={rating} onRatingChange={setRating} />
              </div>
            </div>
  
            <div className="mb-6">
              <Field>
                <Label className="block text-gray-700 font-semibold mb-2">Comment</Label>
                <Textarea 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Field>
            </div>
  
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600 transition duration-200 ease-in-out w-full"
            >
              Submit Review
            </button>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  </>
  );
};

export default Review;
