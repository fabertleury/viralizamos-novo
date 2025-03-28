'use client';

import React, { useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface EmojiSelectorProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiSelector({ value, onChange }: EmojiSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    onChange(emojiData.emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start bg-white"
        >
          {value ? (
            <span className="text-xl mr-2">{value}</span>
          ) : (
            <span className="text-gray-400">Selecionar emoji</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <EmojiPicker
          onEmojiClick={handleEmojiSelect}
          width="100%"
          height="350px"
        />
      </PopoverContent>
    </Popover>
  );
}
