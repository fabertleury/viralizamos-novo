import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      {/* Estatísticas da fila */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Skeleton className="h-8 w-16" />
              </div>
              <p className="text-xs text-muted-foreground">
                <Skeleton className="h-3 w-32 mt-1" />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Skeleton className="h-9 w-full sm:w-[230px]" />
        <Skeleton className="h-9 w-full sm:w-[180px]" />
        <Skeleton className="h-9 w-full sm:w-[130px]" />
      </div>
      
      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="border rounded-md">
            <div className="flex items-center p-4 border-b h-16">
              <Skeleton className="h-5 w-full max-w-[600px]" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3 p-4 border-b last:border-0">
                <Skeleton className="h-4 w-2/3" />
                <div className="flex space-x-4">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[140px]" />
                  <Skeleton className="h-4 w-[120px]" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-7 w-16 rounded-md" />
                  <Skeleton className="h-7 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Paginação */}
      <div className="flex items-center justify-end space-x-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
} 