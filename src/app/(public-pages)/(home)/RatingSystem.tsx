'use client';

import React, { useEffect, useState } from 'react';

import { toast } from 'react-toastify';

import { cn } from '@/utils';
import { useFetchSettings } from '@/hooks';
import { updateRating } from '@/actions';

export const RatingSystem: React.FC<{ userId?: string }> = ({ userId }) => {  
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState(0); 
  const [loading, setLoading] = useState<boolean>(false);

  const { userSettings } = useFetchSettings(!!userId);

  useEffect(() => {
    setRating(userSettings.data?.rating ?? 0);
  }, [userSettings.data]);

  const handleRating = async (index: number) => {
    if (loading) return;
    setLoading(true);
    setRating(index + 1);

    try {
      await updateRating(index + 1);
      setLoading(false);
      toast.success('Thank you for your feedback!');
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message || 'Error updating rating');
      setRating(userSettings.data?.rating ?? 0);
    }
  };

  return (
    <div className="mt-10">
      <p className="text-xl font-bold text-center">Rate us!</p>
      <p className="text-center text-gray-500">We&apos;d love to hear your feedback</p>
      <div className="flex gap-2 justify-center items-center mt-6">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={cn(
              'text-gray-500 hover:text-green-500 transition-all',
              loading || userSettings.isLoading ? 'opacity-50' : 'cursor-pointer',
              hover === 0 && rating > index ? 'text-green-500' : '',
              hover > index ? 'text-green-500' : ''
            )}
            onClick={() => handleRating(index)}
            onMouseEnter={() => setHover(index + 1)}
            onMouseLeave={() => setHover(0)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};
