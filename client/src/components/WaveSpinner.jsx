import { useSpring, animated } from '@react-spring/web';

const WaveSpinner = () => {
  const wave = useSpring({
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(1.2)' },
    config: { tension: 200, friction: 12 },
    loop: true
  });

  return (
    <animated.div style={wave} className="flex justify-center items-center h-screen text-yellow-300 text-2xl font-bold">
      <div className="w-16 h-16 border-4 border-[#0A7F77] border-t-transparent rounded-full animate-spin"></div>
    </animated.div>
  );
};

export default WaveSpinner;
