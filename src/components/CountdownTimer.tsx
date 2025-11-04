import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  seconds: number;
  onComplete: () => void;
}

const CountdownTimer = ({ seconds, onComplete }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const progress = ((seconds - timeLeft) / seconds) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-lg shadow-medium p-6 border border-border">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">Please Wait</h3>
        </div>
        
        <div className="text-center mb-4">
          <div className="text-5xl font-bold text-accent mb-2">
            {timeLeft}
          </div>
          <p className="text-sm text-muted-foreground">
            seconds remaining
          </p>
        </div>

        <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-primary transition-smooth"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
