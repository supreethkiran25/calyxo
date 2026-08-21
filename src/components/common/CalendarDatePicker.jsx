import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, Check } from 'lucide-react';

/**
 * Calyxo Interactive Calendar Date Picker
 *
 * Provides a month calendar dropdown & date navigator matching the sleek iOS dark mode design.
 * Supports quick day jumps, month paging, today indicator, and customizable accent highlights.
 */
export default function CalendarDatePicker({
  selectedDate, // 'YYYY-MM-DD'
  onSelectDate,
  accentColor = '#0088ff', // Or #b5f23d (Acid Green) / iOS Blue
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial selected date or fallback to today
  const selectedDateObj = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();
  
  // Current view month & year state
  const [viewYear, setViewYear] = useState(selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDateObj.getMonth()); // 0-indexed

  // Sync view when selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate + "T00:00:00");
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [selectedDate]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handlePrevDay = (e) => {
    e.stopPropagation();
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() - 1);
    const dateStr = formatDateToLocal(d);
    onSelectDate(dateStr);
  };

  const handleNextDay = (e) => {
    e.stopPropagation();
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + 1);
    const dateStr = formatDateToLocal(d);
    onSelectDate(dateStr);
  };

  const formatDateToLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatDateToLocal(new Date());

  const getDisplayLabel = () => {
    if (!selectedDate) return 'Today';
    if (selectedDate === todayStr) return 'Today';
    const d = new Date(selectedDate + "T00:00:00");
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calendar Day Generation
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const days = [];
  // Empty slots before month start
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ day: null });
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isSelected = formattedDate === selectedDate;
    const isToday = formattedDate === todayStr;
    days.push({ day: d, dateStr: formattedDate, isSelected, isToday });
  }

  const handleSelectDay = (dateStr) => {
    if (!dateStr) return;
    onSelectDate(dateStr);
    setIsOpen(false);
  };

  const handleJumpToday = (e) => {
    e.stopPropagation();
    onSelectDate(todayStr);
    setViewYear(new Date().getFullYear());
    setViewMonth(new Date().getMonth());
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Date Navigation Trigger Bar */}
      <div className="flex items-center gap-1.5 bg-[#141419] border border-white/10 p-1 rounded-2xl shadow-md">
        {/* Left Arrow (Previous Day) */}
        <button
          type="button"
          onClick={handlePrevDay}
          className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer border-none bg-transparent"
          title="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Date Button Dropdown Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white transition-all cursor-pointer border-none"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-[var(--color-acid-green)]" />
          <span className="text-xs font-black uppercase tracking-wider">
            {getDisplayLabel()}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : ''}`} />
        </button>

        {/* Right Arrow (Next Day) */}
        <button
          type="button"
          onClick={handleNextDay}
          className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer border-none bg-transparent"
          title="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown Calendar Popover (Matches Screenshot 3) */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 z-50 w-72 sm:w-80 p-4 rounded-3xl bg-[#111116] border border-white/15 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Calendar Header: Month Year + Paging */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white tracking-wide">
                {monthNames[viewMonth]} {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all border-none bg-transparent cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all border-none bg-transparent cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((w, idx) => (
              <span key={idx} className="text-[9px] font-black uppercase text-gray-500 tracking-wider">
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((item, idx) => {
              if (!item.day) {
                return <div key={`empty-${idx}`} className="w-8 h-8 sm:w-9 sm:h-9" />;
              }

              const isSelected = item.isSelected;
              const isToday = item.isToday;

              return (
                <button
                  key={`day-${item.day}`}
                  type="button"
                  onClick={() => handleSelectDay(item.dateStr)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer border-none ${
                    isSelected
                      ? 'bg-[#0088ff] text-white shadow-lg shadow-[#0088ff]/30 scale-105 font-black'
                      : isToday
                      ? 'bg-white/10 text-[var(--color-acid-green)] border border-[var(--color-acid-green)]/40 hover:bg-white/20'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={handleJumpToday}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold uppercase tracking-wider transition-all border border-white/10 cursor-pointer"
            >
              Today
            </button>
            <span className="text-[10px] text-gray-500 font-mono">
              {selectedDate}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
