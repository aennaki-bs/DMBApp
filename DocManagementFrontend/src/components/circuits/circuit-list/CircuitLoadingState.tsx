
import { Card, CardContent } from '@/components/ui/card';

export function CircuitLoadingState() {
  return (
    <Card className="w-full shadow-md bg-[#111633]/70 border-blue-900/30">
      <CardContent className="p-8">
        <div className="flex justify-center items-center h-24 text-blue-400">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
