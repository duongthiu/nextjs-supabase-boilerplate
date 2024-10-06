'use client'

import { SupabaseClient, User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import LoadingIndicator from "@/components/ui/loading-indicator";
import { getProjects } from '@/utils/supabase/queries';

interface Project {
  id: string;
  name: string;
  client_id: string;
  client_name: string;
  start_date: string;
  end_date: string | null;
  status: string;
}

export default function ProjectsPage({
  user
}: {
  user: User;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[] | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    const supabase: SupabaseClient = createClient();
    const projects = await getProjects(supabase);
    setProjects(projects);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Project List</CardTitle>
            <Link href="/projects/add">
              <Button variant="default">+ Add New</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {/* <div className="flex space-x-2 mb-4">
              <Button variant="default">Active</Button>
              <Button variant="secondary">Completed</Button>
            </div> */}
            <table className="w-full">
              <thead>
                <tr className="text-left bg-muted">
                  <th className="p-2">Name</th>
                  <th className="p-2">Client</th>
                  <th className="p-2">Start Date</th>
                  <th className="p-2">End Date</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects?.map((project) => (
                  <tr key={project.id} className="border-b">
                    <td className="p-2">{project.name}</td>
                    <td className="p-2">{project.client_name}</td>
                    <td className="p-2">{project.start_date}</td>
                    <td className="p-2">{project.end_date || 'Ongoing'}</td>
                    <td className="p-2">
                      <span className={`bg-${project.status === 'Active' ? 'green' : 'blue'}-100 text-${project.status === 'Active' ? 'green' : 'blue'}-800 text-xs font-medium px-2 py-1 rounded`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}