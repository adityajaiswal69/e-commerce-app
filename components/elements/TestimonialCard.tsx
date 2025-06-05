import React from 'react';
import { Quote } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  image: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  company,
  image,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 md:p-8 shadow-lg h-full flex flex-col">
      <div className="mb-6 text-[#e9e2a3]">
        <Quote className="h-8 w-8" />
      </div>
      <p className="text-[#333333] text-lg mb-6 flex-grow">"{quote}"</p>
      <div className="flex items-center">
        <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden mr-4">
          <img 
            src={image} 
            alt={author} 
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-medium text-[#333333]">{author}</h4>
          <p className="text-sm text-[#6c6f7d]">
            {role}{role && company && ' • '}{company}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
