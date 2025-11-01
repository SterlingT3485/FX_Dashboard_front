import React from 'react';
import { DatePicker } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import './DateRangePicker.css';
import './shared/FilterAlignment.css';

const { RangePicker } = DatePicker;

interface DateRangePickerProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onStartDateChange: (date: Dayjs | null) => void;
  onEndDateChange: (date: Dayjs | null) => void;
  onRangeChange?: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  className?: string;
  disabled?: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onRangeChange,
  className = '',
  disabled = false,
}) => {
  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      const [start, end] = dates;
      onStartDateChange(start);
      onEndDateChange(end);
      onRangeChange?.(dates);
    } else {
      onStartDateChange(null);
      onEndDateChange(null);
      onRangeChange?.(null);
    }
  };

  // Disable future dates
  const disabledDate = (current: Dayjs) => {
    return current && current > dayjs().endOf('day');
  };

  return (
    <div className={`date-range-picker ${className}`}>
      <div className="date-picker-section">
        <label className="filter-label">Date Range</label>

        <div className="range-picker-container">
          <RangePicker
            value={[startDate, endDate]}
            onChange={handleRangeChange}
            className="tech-range-picker filter-input"
            size="large"
            format="YYYY-MM-DD"
            placeholder={['Start Date', 'End Date']}
            suffixIcon={<CalendarOutlined className="calendar-icon" />}
            disabledDate={disabledDate}
            disabled={disabled}
            allowClear={true}
            separator={
              <span className="date-separator">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8z" />
                  <path fillRule="evenodd" d="M7.646 2.646a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 4.207V11.5a.5.5 0 0 1-1 0V4.207L5.354 6.354a.5.5 0 1 1-.708-.708l3-3z" />
                </svg>
              </span>
            }
          />
        </div>
      </div>

    </div>
  );
};

export default DateRangePicker;
