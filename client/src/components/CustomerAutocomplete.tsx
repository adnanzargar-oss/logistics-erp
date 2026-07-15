import { useState, useRef, useEffect } from 'react';
import { Customer } from '../types';
import { ChevronDown } from 'lucide-react';

interface Props {
  customers: Customer[];
  value: string;
  onChange: (val: string) => void;
  onSelect: (customer: Customer) => void;
  placeholder?: string;
}

export default function CustomerAutocomplete({ customers, value, onChange, onSelect, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = value.trim()
    ? customers.filter((c) =>
        c.name.toLowerCase().includes(value.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => { setFocused(true); setOpen(true); }}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={placeholder || 'Type name...'}
          className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none pr-8"
        />
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-900 border dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((c) => (
            <div
              key={c.id}
              onMouseDown={() => { onChange(c.name); onSelect(c); setOpen(false); }}
              className="px-3 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer border-b dark:border-gray-700 last:border-0"
            >
              <div className="font-medium">{c.name}</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500">{c.company || ''} {c.gstin ? `GST: ${c.gstin}` : ''} {c.phone ? `| ${c.phone}` : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
