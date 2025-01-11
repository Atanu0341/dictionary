'use client';

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import axios from "axios";

export function Counter() {
    const [actualWordCount, setActualWordCount] = useState<number>(0);
    const [displayedWordCount, setDisplayedWordCount] = useState<number>(0);

    // Function to fetch the word count from the server
    const fetchWordCount = async () => {
      try {
        const response = await axios.get('/api/word-count');
        setActualWordCount(response.data.count);
      } catch (error) {
        console.error('Error fetching word count', error);
      }
    };
  
    // Fetch word count when the component mounts
    useEffect(() => {
      fetchWordCount(); // Initial fetch
      const interval = setInterval(fetchWordCount, 3000); // Poll every 5 seconds
  
      return () => {
        clearInterval(interval); // Cleanup the interval when the component unmounts
      };
    }, []);
  
    // Animate the word count increase
    useEffect(() => {
      if (displayedWordCount < actualWordCount) {
        const animationDuration = 2000; // 2 seconds
        const framesPerSecond = 60;
        const totalFrames = (animationDuration / 1000) * framesPerSecond;
        const incrementPerFrame = (actualWordCount - displayedWordCount) / totalFrames;

        let frame = 0;
        const animationInterval = setInterval(() => {
          frame++;
          if (frame <= totalFrames) {
            setDisplayedWordCount(Math.floor(displayedWordCount + (incrementPerFrame * frame)));
          } else {
            setDisplayedWordCount(actualWordCount);
            clearInterval(animationInterval);
          }
        }, 500 / framesPerSecond);

        return () => clearInterval(animationInterval);
      }
    }, [actualWordCount, displayedWordCount]);

  return (
    <div className="absolute w-[36%] translate-x-[90%] z-10 mt-5 flex items-center justify-center hover:scale-105 transition-all duration-500 hover:-rotate-2">
      <AnimatedGradientText className="cursor-pointer">
        🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />{" "}
        <span
          className={cn(
            `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
          )}
        >
          Total Words in Dictionary: {displayedWordCount}
        </span>
      </AnimatedGradientText>
    </div>
  );
}

