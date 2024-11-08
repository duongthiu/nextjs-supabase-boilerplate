'use client'

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { getProjects } from '@/utils/supabase/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';
import { DEFAULT_ITEMS_PER_PAGE } from '@/utils/constants';

interface ProjectsPageProps {
  user: User;
}

export default function ProjectsPage({ user }: ProjectsPageProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();
  
  useEffect(() => {
    loadProjects();
  }, [currentPage, itemsPerPage]);

  async function loadProjects() {
    try {
      setLoading(true);
      const supabase = createClient();
      const { projects, count } = await getProjects(supabase, currentPage, itemsPerPage);
      if (projects) {
        setProjects(projects);
        setTotalItems(count || 0);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
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
          <CardTitle>Project List</CardTitle>
          <Link href="/projects/add">
            <Button variant="default">+ Add New</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="text-left bg-muted">
                <th className="p-2">Project Code</th>
                <th className="p-2">Project Name</th>
                <th className="p-2">Client</th>
                <th className="p-2">Start Date</th>
                <th className="p-2">End Date</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects?.map((project) => (
                <tr 
                  key={project.id} 
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => router.push(`/projects/edit/${project.id}`)}
                >
                  <td className="p-2">{project.code}</td>
                  <td className="p-2">{project.name}</td>
                  <td className="p-2">{project.client_name}</td>
                  <td className="p-2">{new Date(project.start_date).toLocaleDateString()}</td>
                  <td className="p-2">{project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}</td>
                  <td className="p-2">
                    <span className={`bg-${project.status === 'active' ? 'green' : 'yellow'}-100 text-${project.status === 'active' ? 'green' : 'yellow'}-800 text-xs font-medium px-2 py-1 rounded`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="p-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/projects/edit/${project.id}`);
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