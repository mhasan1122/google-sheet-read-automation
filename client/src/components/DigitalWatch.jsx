// DigitalWatch.jsx
import React, { useEffect, useState } from 'react';

const DigitalWatch = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return <div>{time.toLocaleTimeString()}</div>;
};

export default DigitalWatch;