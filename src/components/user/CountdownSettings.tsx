import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Save, RotateCcw } from 'lucide-react';

interface CountdownSettingsProps {
  currentCountdown: number;
  onCountdownUpdate: (countdown: number) => void;
}

const CountdownSettings: React.FC<CountdownSettingsProps> = ({ 
  currentCountdown, 
  onCountdownUpdate 
}) => {
  const [countdownValue, setCountdownValue] = useState(currentCountdown.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const value = parseInt(countdownValue);
    
    if (isNaN(value) || value < 5 || value > 300) {
      setError('Countdown must be between 5 and 300 seconds');
      return;
    }

    setIsSaving(true);
    
    try {
      await onCountdownUpdate(value);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update countdown. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setCountdownValue('30');
    setError(null);
    setSuccess(false);
  };

  const handleQuickSet = (seconds: number) => {
    setCountdownValue(seconds.toString());
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Countdown Timer Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  Countdown settings saved successfully!
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="countdown">Countdown Duration (seconds)</Label>
                <Input
                  id="countdown"
                  type="number"
                  min="5"
                  max="300"
                  value={countdownValue}
                  onChange={(e) => setCountdownValue(e.target.value)}
                  className="w-full"
                  placeholder="Enter countdown duration"
                />
                <p className="text-sm text-gray-500">
                  Current setting: {currentCountdown} seconds
                </p>
              </div>

              <div className="space-y-2">
                <Label>Quick Set Options</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 30, 45, 60, 90, 120].map((seconds) => (
                    <Button
                      key={seconds}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSet(seconds)}
                      className="text-xs"
                    >
                      {seconds}s
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-gray-900">Settings Preview</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Countdown will start at: <strong>{countdownValue} seconds</strong></p>
                  <p>• Timer will count down from {countdownValue} to 0</p>
                  <p>• After reaching 0, the skip button will appear</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Countdown Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{currentCountdown}</div>
                <div className="text-sm text-gray-600">Current Setting</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-gray-600">Minimum Allowed</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">300</div>
                <div className="text-sm text-gray-600">Maximum Allowed</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">How it works:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• The countdown timer appears on your ad pages</li>
                <li>• Users must wait for the timer to reach zero</li>
                <li>• After the countdown, the skip button becomes available</li>
                <li>• This helps ensure users see your advertisement</li>
                <li>• You can change this setting anytime from your dashboard</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CountdownSettings;