import { cn } from '@/lib/utils';  
import { MoonLoader } from 'react-spinners';

const Loader = ({
  text = '', // Optional text to display below the spinner
  color = 'skyblue', // Tailwind's green-400 in hex
  fullScreen = false,
  className = '',
  spinnerClassName = '',
  size = 20, // default MoonLoader size
}) => {
  return (
    <div
      className={cn(
        'flex text-xs flex-col items-center w-full justify-center h-full',
        fullScreen && 'fixed top-0 inset-0 z-50 bg-white/80 dark:bg-black/40',
        className
      )}
    >
      <MoonLoader color={color} size={size} className={spinnerClassName} />
      {text && <div className="mt-2 text-center" style={{ color }}>{text}</div>}
    </div>
  );
};

export default Loader;