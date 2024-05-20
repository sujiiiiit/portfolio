import React, { useEffect, useRef, useState } from 'react';
import {
  format,
  fromUnixTime,
  startOfMonth,
  getDaysInMonth,
  getDay,
  subMonths,
} from 'date-fns';
import Tippy, { useSingleton } from '@tippyjs/react';

interface CalendarProps {
  submissionCalendar: string; // JSON string of submissions
  selectedMonths: number[]; // Array of selected months
  selectedYear: number;
  isCurrentMonth: boolean;
  monthData: string[];
}

const Calendar: React.FC<CalendarProps> = ({
  submissionCalendar,
  selectedMonths,
  selectedYear,
  monthData,
}) => {
  const subGraphRef = useRef<HTMLDivElement>(null);
  const [submissionCounts, setSubmissionCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const handleResize = () => {
      if (subGraphRef.current) {
        const subGraph = subGraphRef.current;
        subGraph.scrollLeft = subGraph.scrollWidth;
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // Parse the submissionCalendar JSON string
    const submissionData = JSON.parse(submissionCalendar);
    const counts: { [key: string]: number } = {};

    // Convert the timestamps to date strings (format: "dd/MM/yyyy")
    for (const [timestamp, count] of Object.entries(submissionData)) {
      const date = fromUnixTime(Number(timestamp));
      const dateString = format(date, 'dd/MM/yyyy');
      counts[dateString] = count as number;
    }

    setSubmissionCounts(counts);
  }, [submissionCalendar]);

  const renderColorIntensity = (frequency: number) => {
    if (frequency === 0) {
      return 'bg-[#161b22]';
    } else if (frequency > 0 && frequency <= 3) {
      return 'bg-[#006d32]';
    } else if (frequency > 3 && frequency <= 5) {
      return 'bg-[#26a641]';
    } else if (frequency > 5) {
      return 'bg-[#39d353]';
    }
  };

  const [source, target] = useSingleton({
    overrides: ['placement'],
  });

  return (
    <>
      <div
        id="subGraph"
        ref={subGraphRef}
        className="w-full justify-around flex gap-1 relative overflow-hidden overflow-x-scroll"
      >
        {selectedMonths.map((selectedMonth, index) => {
          const date = new Date(selectedYear, selectedMonth);
          const currMonth = selectedMonth;
          const currYear = selectedYear;
          const firstDayOfMonth = getDay(startOfMonth(date));
          const lastDateOfMonth = getDaysInMonth(date);
          const lastDateOfLastMonth = getDaysInMonth(subMonths(date, 1));
          const monthString = format(date, 'MMM');

          const getDatesOfLastMonth = (firstDayOfMonth: number, lastDateOfLastMonth: number) => {
            return Array.from({ length: firstDayOfMonth }, (_, index) => lastDateOfLastMonth - firstDayOfMonth + index + 1);
          };

          const getCurrMonthDates = (lastDateOfMonth: number): number[] => {
            return Array.from({ length: lastDateOfMonth }, (_, i) => i + 1);
          };

          const datesOfLastMonth = getDatesOfLastMonth(firstDayOfMonth, lastDateOfLastMonth);
          const currMonthDateArray = getCurrMonthDates(lastDateOfMonth);

          return (
            <div key={index} className={`monthItem flex flex-col items-center`}>
              <div
                className={`grid grid-rows-7 grid-flow-col gap-x-1 gap-y-1 ${
                  firstDayOfMonth === 0 ? 'ml-[10px]' : ''
                }`}
              >
                {datesOfLastMonth.map((_date, index) => (
                  <div key={`empty-${index}`} className="invisible row-span-1" />
                ))}

                {currMonthDateArray.map((x, dayIndex) => {
                  const dateString = format(new Date(currYear, currMonth, x), 'dd/MM/yyyy');
                  const frequency = submissionCounts[dateString] || 0;

                  return (
                    <Tippy
                      moveTransition="transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)"
                      singleton={target}
                      delay={500}
                      arrow={false}
                      theme="custom"
                      key={`box-${dayIndex + 1}`}
                      content={`${frequency} submissions on ${monthData[selectedMonth]} ${x}, ${selectedYear}`}
                      placement="top"
                    >
                      <div
                        className={`${
                          frequency > 0
                            ? renderColorIntensity(frequency)
                            : `bg-transparentWhite`
                        }  row-span-1 w-[1rem] h-[1rem] rounded-[3px]`}
                      />
                    </Tippy>
                  );
                })}
              </div>
              <div className="mt-2 font-Gist text-center text-textSecondary text-xs">{monthString}</div>
            </div>
          );
        })}
      </div>
      <Tippy
        moveTransition="transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)"
        singleton={source}
        delay={500}
        content=""
        placement="top"
      ></Tippy>
    </>
  );
};

export default Calendar;
