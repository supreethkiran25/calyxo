import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

/**
 * Calyxo Interactive Calendar Date Picker
 *
 * Provides a month calendar dropdown & date navigator matching the sleek mobile theme system.
 * Supports quick day jumps, month paging, today indicator, and theme-adaptive styling.
 */
export default function CalendarDatePicker({
  selectedDate, // 'YYYY-MM-DD'
  onSelectDate,
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
      <div className="flex items-center gap-1 bg-surface border border-card-border p-1 rounded-2xl shadow-xs select-none">
        {/* Left Arrow (Previous Day) */}
        <button
          type="button"
          onClick={handlePrevDay}
          className="p-1.5 rounded-xl text-secondary hover:text-foreground hover:bg-surface-subtle transition-all cursor-pointer border-none bg-transparent"
          title="Previous Day"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>

        {/* Date Button Dropdown Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-surface-interactive text-foreground transition-all cursor-pointer border border-card-border/60"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-black uppercase tracking-wider text-foreground">
            {getDisplayLabel()}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
        </button>

        {/* Right Arrow (Next Day) */}
        <button
          type="button"
          onClick={handleNextDay}
          className="p-1.5 rounded-xl text-secondary hover:text-foreground hover:bg-surface-subtle transition-all cursor-pointer border-none bg-transparent"
          title="Next Day"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[9998] sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Calendar Popover */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-[9999] w-[calc(100vw-32px)] max-w-[320px] sm:w-80 p-4 rounded-3xl bg-surface border border-card-border shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Calendar Header: Month Year + Paging */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-card-border/60">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-foreground tracking-wide">
                {monthNames[viewMonth]} {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl hover:bg-surface-subtle text-secondary hover:text-foreground transition-all border-none bg-transparent cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-surface-subtle text-secondary hover:text-foreground transition-all border-none bg-transparent cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((w, idx) => (
              <span key={idx} className="text-[9px] font-black uppercase text-muted tracking-wider">
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
                      ? 'bg-accent text-accent-foreground font-black shadow-md scale-105'
                      : isToday
                      ? 'bg-surface-subtle text-accent border border-accent/40 font-black'
                      : 'text-foreground hover:bg-surface-subtle'
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="mt-4 pt-3 border-t border-card-border/60 flex items-center justify-between">
            <button
              type="button"
              onClick={handleJumpToday}
              className="px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-accent hover:text-accent-foreground text-foreground text-[11px] font-black uppercase tracking-wider transition-all border border-card-border cursor-pointer"
            >
              Jump to Today
            </button>
            <span className="text-[10px] text-muted font-mono">
              {selectedDate}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
