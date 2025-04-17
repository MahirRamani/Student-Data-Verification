// src/components/HistoryTab.tsx
import { useEffect, useState } from "react";
import { useStudentStore } from "../store/studentStore";
import { getUpdateHistory } from "../services/api";
import { UpdateHistory } from "../types/students";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Skeleton } from "./ui/skeleton";

const HistoryTab = () => {
  const student = useStudentStore();
  const [history, setHistory] = useState<UpdateHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        console.log("Roll no:", student.roll_no);
        const data = await getUpdateHistory(student.roll_no);
        console.log("History data:", data);

        setHistory(data);
      } catch (err: any) {
        console.error("Failed to fetch history:", err);
        setError("Failed to load update history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [student.roll_no]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString().split(",")[0];
  };

  // if (loading) {
  //   return (
  //     <div className="space-y-4">
  //       {[1, 2, 3].map(i => (
  //         <Card key={i} className="overflow-hidden">
  //           <CardHeader className="p-4">
  //             <Skeleton className="h-5 w-1/3" />
  //             <Skeleton className="h-4 w-1/4" />
  //           </CardHeader>
  //           <CardContent className="p-4">
  //             <Skeleton className="h-4 w-full mb-2" />
  //             <Skeleton className="h-4 w-2/3" />
  //           </CardContent>
  //         </Card>
  //       ))}
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <Card className="bg-red-50 border-red-200">
  //       <CardContent className="p-4">
  //         <p className="text-red-600">{error}</p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  // if (history.length === 0) {
  //   return (
  //     <Card>
  //       <CardContent className="p-6 text-center">
  //         <p className="text-gray-500">No update history found.</p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  // return (
  //   <div className="space-y-4">
  //     {history.map((item) => (
  //       <Card key={item.id} className="overflow-hidden">
  //         <CardHeader className="py-3 px-4 bg-slate-50">
  //           <CardTitle className="text-base font-medium">
  //             {item.field_name.replace('_', ' ')} Updated
  //           </CardTitle>
  //           <CardDescription>{formatDate(item.update_date)}</CardDescription>
  //         </CardHeader>
  //         <CardContent className="p-4">
  //           <div className="flex flex-col space-y-1">
  //             <div className="flex space-x-2">
  //               <span className="text-sm font-medium text-gray-500">From:</span>
  //               <span className="text-sm">{item.old_value || '(empty)'}</span>
  //             </div>
  //             <div className="flex space-x-2">
  //               <span className="text-sm font-medium text-gray-500">To:</span>
  //               <span className="text-sm">{item.new_value || '(empty)'}</span>
  //             </div>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     ))}
  //   </div>
  // );

  if (loading) {
    return (
      <div className="space-y-4 px-2">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="overflow-hidden border border-gray-200 shadow-sm"
          >
            <CardHeader className="p-3 sm:p-4">
              <Skeleton className="h-5 w-1/3 rounded" />
              <Skeleton className="h-4 w-1/4 rounded mt-2" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <Skeleton className="h-4 w-full mb-2 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200 shadow-sm mx-2">
        <CardContent className="p-4">
          <p className="text-red-600 text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-sm mx-2">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No update history found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 px-2 sm:px-0">
      {history.map((item) => (
        <Card
          key={item.id}
          className="overflow-hidden border border-gray-200 shadow-sm hover:shadow transition-shadow"
        >
          <CardHeader className="py-3 px-4 bg-slate-50 border-b">
            <CardTitle className="text-base font-medium flex justify-between items-center">
              <span>{item.field_name.replace("", " ")} Updated</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {formatDate(item.update_date)}
              </span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {formatDate(item.update_date)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col sm:flex-row sm:space-x-2">
                <span className="text-sm font-medium text-gray-500">From:</span>
                <span className="text-sm bg-gray-50 px-2 py-1 rounded w-full sm:w-auto">
                  {item.old_value || "(empty)"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-2">
                <span className="text-sm font-medium text-gray-500">To:</span>
                <span className="text-sm bg-green-50 text-green-800 px-2 py-1 rounded w-full sm:w-auto">
                  {item.new_value || "(empty)"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HistoryTab;
