// src/components/HistoryTab.tsx
import { useEffect, useState } from 'react';
import { useStudentStore } from '../store/studentStore';
import { getUpdateHistory } from '../services/api';
import { UpdateHistory } from '../types/students';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

const HistoryTab = () => {
  const student = useStudentStore();
  const [history, setHistory] = useState<UpdateHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await getUpdateHistory(student.roll_no);
        setHistory(data);
      } catch (err: any) {
        console.error('Failed to fetch history:', err);
        setError('Failed to load update history.');
      } finally {
        setLoading(false);
      }
    };
    
    loadHistory();
  }, [student.roll_no]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No update history found.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {history.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardHeader className="py-3 px-4 bg-slate-50">
            <CardTitle className="text-base font-medium">
              {item.field_name.replace('_', ' ')} Updated
            </CardTitle>
            <CardDescription>{formatDate(item.update_date)}</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1">
              <div className="flex space-x-2">
                <span className="text-sm font-medium text-gray-500">From:</span>
                <span className="text-sm">{item.old_value || '(empty)'}</span>
              </div>
              <div className="flex space-x-2">
                <span className="text-sm font-medium text-gray-500">To:</span>
                <span className="text-sm">{item.new_value || '(empty)'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HistoryTab;