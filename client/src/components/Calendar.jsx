// Calendar.jsx
import React from 'react';

const Calendar = () => {
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return <div>{today.toLocaleDateString(undefined, options)}</div>;
};

export default Calendar;