"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ActivityGraphProps {
  data: number[];
  className?: string;
  fullWidth?: boolean;
}

export function ActivityGraph({
  data,
  className = "",
  fullWidth = false,
}: ActivityGraphProps) {
  const maxValue = Math.max(...data);

  const getIntensity = (value: number) => {
    if (value === 0) return 0;
    if (value <= maxValue * 0.25) return 1;
    if (value <= maxValue * 0.5) return 2;
    if (value <= maxValue * 0.75) return 3;
    return 4;
  };

  const getColor = (intensity: number) => {
    switch (intensity) {
      case 0:
        return "bg-muted";
      case 1:
        return "bg-green-200 dark:bg-green-900";
      case 2:
        return "bg-green-300 dark:bg-green-700";
      case 3:
        return "bg-green-400 dark:bg-green-600";
      case 4:
        return "bg-green-500 dark:bg-green-500";
      default:
        return "bg-muted";
    }
  };

  const getWeekDateRange = (weekIndex: number) => {
    const now = new Date();
    const weeksAgo = 11 - weekIndex;
    const endDate = new Date(now);
    endDate.setDate(now.getDate() - weeksAgo * 7);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);

    return {
      start: startDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      end: endDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    };
  };

  return (
    <TooltipProvider>
      <div className={`flex items-end gap-1 ${className}`}>
        {data.map((value, index) => {
          const { start, end } = getWeekDateRange(index);
          return (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-end h-12",
                    fullWidth ? "w-full" : "w-3"
                  )}
                >
                  <div
                    className={`w-full h-full rounded-sm ${getColor(
                      getIntensity(value)
                    )} transition-colors hover:opacity-80`}
                    style={{
                      height: `${Math.max(8, (value / maxValue) * 48)}px`,
                    }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <div className="font-medium">{value} requests</div>
                  <div className="text-muted-foreground">
                    {start} - {end}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
