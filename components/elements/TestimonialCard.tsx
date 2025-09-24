import React from 'react';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

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
    <div className="bg-white rounded-lg p-6 md:p-8 shadow-lg h-80 flex flex-col">
      <div className="mb-4 text-[#333333]">
        <ChatBubbleLeftIcon className="h-8 w-8" />
      </div>
      <p className="text-[#333333] text-lg mb-6 flex-grow overflow-hidden">"{quote}"</p>
      <div className="flex items-center mt-auto">
        <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden mr-4 flex-shrink-0">
          <img 
            src={image} 
            alt={author} 
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h4 className="font-medium text-[#333333] truncate">{author}</h4>
          <p className="text-sm text-[#6c6f7d] truncate">
            {role}{role && company && ' • '}{company}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
