'use client'

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { getAllocations } from '@/utils/supabase/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';
import { DEFAULT_ITEMS_PER_PAGE } from '@/utils/constants';

interface AllocationsPageProps {
  user: User;
}

export default function AllocationsPage({ user }: AllocationsPageProps) {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();
  
  useEffect(() => {
    loadAllocations();
  }, [currentPage, itemsPerPage]);

  async function loadAllocations() {
    try {
      setLoading(true);
      const supabase = createClient();
      const { allocations, count } = await getAllocations(supabase, currentPage, itemsPerPage);
      if (allocations) {
        setAllocations(allocations);
        setTotalItems(count || 0);
      }
    } catch (error) {
      console.error('Error loading allocations:', error);
    } finally {
      setLoading(false);
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Allocation List</CardTitle>
          <Link href="/allocations/add">
            <Button variant="default">+ Add New</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="text-left bg-muted">
                <th className="p-2">Employee</th>
                <th className="p-2">Project</th>
                <th className="p-2">Start Date</th>
                <th className="p-2">End Date</th>
                <th className="p-2">Allocation %</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allocations?.map((allocation) => (
                <tr 
                  key={allocation.id} 
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => router.push(`/allocations/edit/${allocation.id}`)}
                >
                  <td className="p-2">{allocation.employee_name}</td>
                  <td className="p-2">{allocation.project_name}</td>
                  <td className="p-2">{new Date(allocation.start_date).toLocaleDateString()}</td>
                  <td className="p-2">{new Date(allocation.end_date).toLocaleDateString()}</td>
                  <td className="p-2">{allocation.allocation_percentage}%</td>
                  <td className="p-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/allocations/edit/${allocation.id}`);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
} 