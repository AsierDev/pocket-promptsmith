'use client';

import { KeyboardEvent, useState } from 'react';

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

export const TagInput = ({ value, onChange, placeholder }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const trimmed = inputValue.trim().replace(/^#+/, '');
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
      }
      setInputValue('');
    }

    if (event.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => onChange(value.filter((item) => item !== tag));

  return (
    <div className="rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <button
            type="button"
            key={tag}
            onClick={() => removeTag(tag)}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          >
            #{tag}
          </button>
        ))}
        <input
          type="text"
          className="flex-1 border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-400"
          value={inputValue}
          placeholder={placeholder}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};
