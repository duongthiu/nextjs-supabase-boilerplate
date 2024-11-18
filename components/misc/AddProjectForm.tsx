'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from '@/utils/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { Autocomplete } from '@/components/ui/autocomplete';
import { CustomCheckbox } from '@/components/ui/custom-checkbox';
import { useTenant } from '@/utils/tenant-context';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { format, startOfWeek, endOfWeek, addWeeks, eachDayOfInterval, isSameMonth } from 'date-fns';
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { 
  getClients, 
  addProject, 
  getProject, 
  updateProject, 
  getKnowledges, 
  getProjectKnowledges, 
  addProjectKnowledge, 
  removeProjectKnowledge, 
  getEmployeeSuggestions,
  updateAllocation,
  addAllocation
} from '@/utils/supabase/queries';

interface FormData {
  code: string;
  name: string;
  client_id: string;
  currency: string;
  contract_owner: string;
  start_date: string;
  end_date: string;
  deal_status: string;
  billable: string;
  engagement_manager_email: string;
  note: string;
}

const initialFormData: FormData = {
  code: '',
  name: '',
  client_id: '',
  currency: '',
  contract_owner: '',
  start_date: '',
  end_date: '',
  deal_status: 'PENDING',
  billable: 'false',
  engagement_manager_email: '',
  note: '',
};

interface Client {
  id: string;
  name: string;
}

interface Knowledge {
  id: string;
  title: string;
}

interface TimeSlot {
  start: Date;
  end: Date;
  allocation: number;
}

interface EmployeeSuggestion {
  id: string;
  given_name: string;
  surname: string;
  matching_skills: number;
  Allocations: {
    allocation_percentage: number;
    start_date: string;
    end_date: string;
  }[];
  knowledges: string[];
}

interface AllocatedEmployee {
  id: string;
  given_name: string;
  surname: string;
  Allocations: {
    allocation_percentage: number;
    start_date: string;
    end_date: string;
  }[];
}

interface AllocationFormData {
  start_date: string;
  end_date: string;
  allocation_percentage: string;
}

const getCellColor = (workload: number) => {
  if (workload === 0) return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400';
  if (workload <= 50) return 'bg-green-200 dark:bg-green-900/50 text-green-900 dark:text-green-100';
  if (workload <= 80) return 'bg-yellow-200 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100';
  if (workload <= 100) return 'bg-orange-200 dark:bg-orange-900/50 text-orange-900 dark:text-orange-100';
  return 'bg-red-200 dark:bg-red-900/50 text-red-900 dark:text-red-100';
};

export default function AddProjectForm({ projectId }: { projectId: string | null }) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const router = useRouter();
  const supabase: SupabaseClient = createClient();
  const { currentTenant } = useTenant();
  const [knowledges, setKnowledges] = useState<Knowledge[]>([]);
  const [selectedKnowledges, setSelectedKnowledges] = useState<string[]>([]);
  const [knowledgeSearchOpen, setKnowledgeSearchOpen] = useState(false);
  const [employeeSuggestions, setEmployeeSuggestions] = useState<EmployeeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allocatedEmployees, setAllocatedEmployees] = useState<AllocatedEmployee[]>([]);
  const [editingAllocationId, setEditingAllocationId] = useState<string | null>(null);
  const [addingAllocationForEmployee, setAddingAllocationForEmployee] = useState<string | null>(null);
  const [allocationFormData, setAllocationFormData] = useState<AllocationFormData>({
    start_date: '',
    end_date: '',
    allocation_percentage: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!currentTenant) {
        return;
      }

      try {
        setLoading(true);
        // Fetch clients
        const { clients: clientsData } = await getClients(supabase, currentTenant!.id);
        if (clientsData) {
          setClients(clientsData);
        }

        // Fetch knowledges
        const { knowledges: knowledgesData } = await getKnowledges(supabase, currentTenant.id);
        if (knowledgesData) {
          setKnowledges(knowledgesData);
        }

        // Fetch project if editing
        if (projectId) {
          const project = await getProject(supabase, projectId);
          if (project) {
            setFormData({
              ...initialFormData,
              ...project,
              start_date: project.start_date ? project.start_date.split('T')[0] : '',
              end_date: project.end_date ? project.end_date.split('T')[0] : '',
              billable: project.billable?.toString() || 'false',
              deal_status: project.deal_status || 'PENDING',
            });
          }

          // If editing, fetch project's knowledges
          const projectKnowledges = await getProjectKnowledges(supabase, projectId);
          if (projectKnowledges) {
            setSelectedKnowledges(projectKnowledges.map(pk => pk.knowledge_id));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, currentTenant]);

  useEffect(() => {
    const fetchAllocatedEmployees = async () => {
      if (!projectId || !currentTenant) return;
      
      try {
        const { data: employees } = await supabase
          .from('Employees')
          .select(`
            id,
            given_name,
            surname,
            Allocations!inner (
              allocation_percentage,
              start_date,
              end_date
            )
          `)
          .eq('tenant_id', currentTenant.id)
          .eq('Allocations.project_id', projectId);

        if (employees) {
          setAllocatedEmployees(employees);
        }
      } catch (error) {
        console.error('Error fetching allocated employees:', error);
      }
    };

    fetchAllocatedEmployees();
  }, [projectId, currentTenant]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log('Selected value:', value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentTenant) {
      setError('No tenant selected. Please select a tenant from account settings.');
      return;
    }

    if (!formData.code || !formData.name || !formData.client_id || !formData.contract_owner || !formData.engagement_manager_email) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      let data;
      const projectData = {
        ...formData,
        tenant_id: currentTenant.id
      };

      if (projectId) {
        data = await updateProject(supabase, { id: projectId, ...projectData });
        // Update knowledges
        await removeProjectKnowledge(supabase, projectId);
        if (selectedKnowledges.length > 0) {
          await addProjectKnowledge(supabase, projectId, selectedKnowledges);
        }
      } else {
        data = await addProject(supabase, projectData);
        // Add knowledges for new project
        if (data && selectedKnowledges.length > 0) {
          await addProjectKnowledge(supabase, data[0].id, selectedKnowledges);
        }
      }

      console.log('Project added/updated successfully:', data);
      router.push('/projects');
    } catch (error: any) {
      setError(error.message || 'Failed to add project.');
      console.error('Error adding project:', error);
    }
  };

  const ClientSelector = () => {
    if (!isSearchMode) {
      return (
        <Select 
          key="select-mode"
          value={formData.client_id}
          onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Autocomplete
        key="search-mode"
        options={clients}
        value={formData.client_id}
        onChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
        placeholder="Search clients..."
      />
    );
  };

  const handleKnowledgeSelect = (knowledgeId: string) => {
    setSelectedKnowledges(current => {
      if (current.includes(knowledgeId)) {
        return current.filter(id => id !== knowledgeId);
      }
      return [...current, knowledgeId];
    });
  };

  const removeKnowledge = (knowledgeId: string) => {
    setSelectedKnowledges(current => current.filter(id => id !== knowledgeId));
  };

  // Helper function to get overlapping time slots
  const getOverlappingTimeSlots = (allocations: any[]): TimeSlot[] => {
    if (allocations.length === 0) return [];

    // Sort all start and end dates
    const events: Array<{ date: Date; isStart: boolean; allocation: number }> = [];
    allocations.forEach(alloc => {
      events.push({ 
        date: new Date(alloc.start_date), 
        isStart: true, 
        allocation: alloc.allocation_percentage 
      });
      events.push({ 
        date: new Date(alloc.end_date), 
        isStart: false, 
        allocation: alloc.allocation_percentage 
      });
    });

    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    const timeSlots: TimeSlot[] = [];
    let currentAllocation = 0;
    let lastDate: Date | null = null;

    events.forEach((event, index) => {
      if (lastDate && currentAllocation > 0) {
        timeSlots.push({
          start: lastDate,
          end: event.date,
          allocation: currentAllocation
        });
      }

      if (event.isStart) {
        currentAllocation += event.allocation;
      } else {
        currentAllocation -= event.allocation;
      }
      
      lastDate = event.date;
    });

    return timeSlots;
  };

  // Function to calculate available allocation for a given period
  const getAvailableAllocation = (
    timeSlots: TimeSlot[],
    start: Date,
    end: Date
  ): { 
    periods: Array<{ start: Date; end: Date; maxAllocation: number }> 
  } => {
    const periods: Array<{ start: Date; end: Date; maxAllocation: number }> = [];
    let currentDate = new Date(start);

    while (currentDate < end) {
      const overlappingSlots = timeSlots.filter(slot => 
        slot.start <= currentDate && slot.end >= currentDate
      );

      const currentAllocation = overlappingSlots.reduce(
        (sum, slot) => sum + slot.allocation, 
        0
      );

      const nextChange = overlappingSlots.length > 0
        ? Math.min(
            ...overlappingSlots.map(slot => slot.end.getTime()),
            end.getTime()
          )
        : end.getTime();

      periods.push({
        start: new Date(currentDate),
        end: new Date(nextChange),
        maxAllocation: Math.max(0, 100 - currentAllocation)
      });

      currentDate = new Date(nextChange);
    }

    return { periods };
  };

  const updateEmployeeSuggestions = useCallback(async () => {
    if (!currentTenant || selectedKnowledges.length === 0 || !formData.start_date || !formData.end_date) {
      setEmployeeSuggestions([]);
      return;
    }

    try {
      const supabase = createClient();
      const employees = await getEmployeeSuggestions(supabase, currentTenant.id, selectedKnowledges);

      // Map directly to EmployeeSuggestion type
      const suggestions = employees.map(employee => ({
        id: employee.id,
        given_name: employee.given_name,
        surname: employee.surname,
        matching_skills: employee.EmployeeKnowledges.length,
        Allocations: employee.Allocations || [],
        knowledges: employee.EmployeeKnowledges.map((ek: any) => ek.knowledge_id)
      }));

      // Sort by matching skills
      const sortedSuggestions = suggestions.sort((a, b) => b.matching_skills - a.matching_skills);

      setEmployeeSuggestions(sortedSuggestions);
    } catch (error) {
      console.error('Error updating employee suggestions:', error);
    }
  }, [currentTenant, selectedKnowledges, formData.start_date, formData.end_date]);

  // Update suggestions when knowledges change
  useEffect(() => {
    updateEmployeeSuggestions();
  }, [selectedKnowledges, updateEmployeeSuggestions]);

  // Update the EmployeeSuggestions component
  const EmployeeSuggestions = () => {
    // Generate weeks array for the entire project duration
    const weeksArray = useMemo(() => {
      if (!formData.start_date || !formData.end_date) return [];

      const result = [];
      const projectStart = new Date(formData.start_date);
      const projectEnd = new Date(formData.end_date);
      const today = new Date();

      // Start from the project start date
      let currentDate = startOfWeek(projectStart);
      
      // Calculate weeks until project end
      while (currentDate <= projectEnd) {
        const weekEnd = endOfWeek(currentDate);
        result.push({
          start: currentDate,
          end: weekEnd,
          days: eachDayOfInterval({ start: currentDate, end: weekEnd })
        });
        currentDate = addWeeks(currentDate, 1);
      }

      return result;
    }, [formData.start_date, formData.end_date]);

    // Calculate initial scroll position once for all employees
    useEffect(() => {
      if (weeksArray.length > 0) {
        const scrollContainers = document.querySelectorAll('.employee-workload-scroll');
        if (scrollContainers.length === 0) return;

        const today = new Date();
        const projectStart = new Date(formData.start_date);
        const projectEnd = new Date(formData.end_date);
        
        // Determine which week to focus on
        let targetDate;
        if (projectStart > today) {
          targetDate = projectStart;
        } else if (projectEnd < today) {
          targetDate = projectEnd;
        } else {
          targetDate = today;
        }

        // Find the index of the target week
        const targetWeekIndex = weeksArray.findIndex(week => 
          targetDate >= week.start && targetDate <= week.end
        );

        if (targetWeekIndex !== -1) {
          const weekWidth = 32; // w-8 = 2rem = 32px
          scrollContainers.forEach(container => {
            const scrollPosition = Math.max(0, (weekWidth * targetWeekIndex) - (container.clientWidth / 2));
            requestAnimationFrame(() => {
              container.scrollLeft = scrollPosition;
            });
          });
        }
      }
    }, [weeksArray, formData.start_date, formData.end_date]);

    // Calculate workload for each employee per week
    const employeeWorkload = useMemo(() => {
      const workload: Record<string, Record<string, number>> = {};

      employeeSuggestions.forEach(employee => {
        workload[employee.id] = {};

        weeksArray.forEach(week => {
          const weekKey = format(week.start, 'yyyy-MM-dd');
          
          employee.Allocations.forEach(allocation => {
            const allocationStart = new Date(allocation.start_date);
            const allocationEnd = new Date(allocation.end_date);

            // Check if allocation overlaps with this week
            if (allocationStart <= week.end && allocationEnd >= week.start) {
              workload[employee.id][weekKey] = (workload[employee.id][weekKey] || 0) + 
                allocation.allocation_percentage;
            }
          });
        });
      });

      return workload;
    }, [employeeSuggestions, weeksArray]);

    return (
      <div className="mt-4">
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="show-suggestions"
            checked={showSuggestions}
            onCheckedChange={setShowSuggestions}
          />
          <Label htmlFor="show-suggestions">Show Employee Suggestions</Label>
        </div>

        {showSuggestions && selectedKnowledges.length > 0 && formData.start_date && formData.end_date && (
          <div className="space-y-4">
            {employeeSuggestions.length > 0 ? (
              employeeSuggestions.map((employee) => (
                <div
                  key={employee.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {employee.given_name} {employee.surname}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Matching skills: {employee.matching_skills}/{selectedKnowledges.length}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (addingAllocationForEmployee === employee.id) {
                          setAddingAllocationForEmployee(null);
                          setAllocationFormData({
                            start_date: '',
                            end_date: '',
                            allocation_percentage: '',
                          });
                        } else {
                          setAddingAllocationForEmployee(employee.id);
                          // Pre-fill with project dates
                          setAllocationFormData({
                            start_date: formData.start_date,
                            end_date: formData.end_date,
                            allocation_percentage: '',
                          });
                        }
                      }}
                    >
                      {addingAllocationForEmployee === employee.id ? 'Cancel' : 'Add Allocation'}
                    </Button>
                  </div>

                  {addingAllocationForEmployee === employee.id && (
                    <AllocationForm 
                      employeeId={employee.id}
                      isEdit={false}
                    />
                  )}

                  {/* Scrollable Heatmap Container */}
                  <div className="rounded border bg-muted/50 p-2">
                    <div className="flex items-center gap-1">
                      <div className="shrink-0 w-20 text-sm font-medium">Workload</div>
                      <div className="relative w-[calc(100%-5rem)]">
                        <div 
                          className="employee-workload-scroll overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-400 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent"
                          style={{ scrollBehavior: 'smooth' }}
                        >
                          <div style={{ 
                            width: `${weeksArray.length * 32}px`,
                            minWidth: '100%'
                          }}>
                            {/* Week dates header */}
                            <div className="flex border-b dark:border-zinc-700 pb-2">
                              {weeksArray.map((week, index) => (
                                <div 
                                  key={index}
                                  className={cn(
                                    "w-8 shrink-0 text-center text-xs",
                                    isSameMonth(week.start, new Date()) 
                                      ? "text-blue-600 dark:text-blue-400" 
                                      : "text-muted-foreground"
                                  )}
                                  title={format(week.start, 'MMM d, yyyy')}
                                >
                                  {format(week.start, 'MMM d')}
                                </div>
                              ))}
                            </div>
                            
                            {/* Workload heatmap */}
                            <div className="flex pt-2">
                              {weeksArray.map((week, index) => {
                                const weekKey = format(week.start, 'yyyy-MM-dd');
                                const workload = employeeWorkload[employee.id][weekKey] || 0;
                                return (
                                  <div
                                    key={index}
                                    className={cn(
                                      "w-8 h-8 shrink-0 flex items-center justify-center text-xs rounded",
                                      getCellColor(workload),
                                      isSameMonth(week.start, new Date()) 
                                        ? "ring-1 ring-blue-500/20" 
                                        : ""
                                    )}
                                    title={`Week of ${format(week.start, 'MMM d')}: ${workload}%`}
                                  >
                                    {workload > 0 && workload}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        {/* Gradient overlays */}
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-muted/50 to-transparent pointer-events-none" />
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-muted/50 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-center py-4">
                No employees found with matching skills
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-4 h-4 rounded",
                  "bg-green-200 dark:bg-green-900/50"
                )}></div>
                <span>≤ 50%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-4 h-4 rounded",
                  "bg-yellow-200 dark:bg-yellow-900/50"
                )}></div>
                <span>51-80%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-4 h-4 rounded",
                  "bg-orange-200 dark:bg-orange-900/50"
                )}></div>
                <span>81-100%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-4 h-4 rounded",
                  "bg-red-200 dark:bg-red-900/50"
                )}></div>
                <span>&gt; 100%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const AllocatedEmployees = () => {
    // Reuse the same weeksArray and scroll logic from EmployeeSuggestions
    const weeksArray = useMemo(() => {
      if (!formData.start_date || !formData.end_date) return [];

      const result = [];
      const projectStart = new Date(formData.start_date);
      const projectEnd = new Date(formData.end_date);
      const today = new Date();

      // Start from the project start date
      let currentDate = startOfWeek(projectStart);
      
      // Calculate weeks until project end
      while (currentDate <= projectEnd) {
        const weekEnd = endOfWeek(currentDate);
        result.push({
          start: currentDate,
          end: weekEnd,
          days: eachDayOfInterval({ start: currentDate, end: weekEnd })
        });
        currentDate = addWeeks(currentDate, 1);
      }

      return result;
    }, [formData.start_date, formData.end_date]);

    // Reuse the same scroll effect
    useEffect(() => {
      if (weeksArray.length > 0) {
        const scrollContainers = document.querySelectorAll('.allocated-workload-scroll');
        if (scrollContainers.length === 0) return;

        const today = new Date();
        const projectStart = new Date(formData.start_date);
        const projectEnd = new Date(formData.end_date);
        
        let targetDate;
        if (projectStart > today) {
          targetDate = projectStart;
        } else if (projectEnd < today) {
          targetDate = projectEnd;
        } else {
          targetDate = today;
        }

        const targetWeekIndex = weeksArray.findIndex(week => 
          targetDate >= week.start && targetDate <= week.end
        );

        if (targetWeekIndex !== -1) {
          const weekWidth = 32;
          scrollContainers.forEach(container => {
            const scrollPosition = Math.max(0, (weekWidth * targetWeekIndex) - (container.clientWidth / 2));
            requestAnimationFrame(() => {
              container.scrollLeft = scrollPosition;
            });
          });
        }
      }
    }, [weeksArray, formData.start_date, formData.end_date]);

    // Calculate workload for allocated employees
    const employeeWorkload = useMemo(() => {
      const workload: Record<string, Record<string, number>> = {};

      allocatedEmployees.forEach(employee => {
        workload[employee.id] = {};

        weeksArray.forEach(week => {
          const weekKey = format(week.start, 'yyyy-MM-dd');
          
          employee.Allocations.forEach(allocation => {
            const allocationStart = new Date(allocation.start_date);
            const allocationEnd = new Date(allocation.end_date);

            if (allocationStart <= week.end && allocationEnd >= week.start) {
              workload[employee.id][weekKey] = (workload[employee.id][weekKey] || 0) + 
                allocation.allocation_percentage;
            }
          });
        });
      });

      return workload;
    }, [allocatedEmployees, weeksArray]);

    return (
      <div className="space-y-4">
        {allocatedEmployees.length > 0 ? (
          allocatedEmployees.map((employee) => (
            <div
              key={employee.id}
              className="p-3 border rounded-lg hover:bg-muted/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {employee.given_name} {employee.surname}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (editingAllocationId === employee.id) {
                      setEditingAllocationId(null);
                      setAllocationFormData({
                        start_date: '',
                        end_date: '',
                        allocation_percentage: '',
                      });
                    } else {
                      setEditingAllocationId(employee.id);
                      const allocation = employee.Allocations[0];
                      setAllocationFormData({
                        start_date: allocation.start_date.split('T')[0],
                        end_date: allocation.end_date.split('T')[0],
                        allocation_percentage: allocation.allocation_percentage.toString(),
                      });
                    }
                  }}
                >
                  {editingAllocationId === employee.id ? 'Cancel Edit' : 'Edit Allocation'}
                </Button>
              </div>

              {editingAllocationId === employee.id && (
                <AllocationForm 
                  employeeId={employee.id} 
                  isEdit={true}
                  currentAllocation={employee.Allocations[0]}
                />
              )}

              {/* Scrollable Heatmap Container */}
              <div className="rounded border bg-muted/50 p-2">
                <div className="flex items-center gap-1">
                  <div className="shrink-0 w-20 text-sm font-medium">Workload</div>
                  <div className="relative w-[calc(100%-5rem)]">
                    <div 
                      className="allocated-workload-scroll overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-400 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent"
                      style={{ scrollBehavior: 'smooth' }}
                    >
                      <div style={{ 
                        width: `${weeksArray.length * 32}px`,
                        minWidth: '100%'
                      }}>
                        {/* Week dates header */}
                        <div className="flex border-b dark:border-zinc-700 pb-2">
                          {weeksArray.map((week, index) => (
                            <div 
                              key={index}
                              className={cn(
                                "w-8 shrink-0 text-center text-xs",
                                isSameMonth(week.start, new Date()) 
                                  ? "text-blue-600 dark:text-blue-400" 
                                  : "text-muted-foreground"
                              )}
                              title={format(week.start, 'MMM d, yyyy')}
                            >
                              {format(week.start, 'MMM d')}
                            </div>
                          ))}
                        </div>
                        
                        {/* Workload heatmap */}
                        <div className="flex pt-2">
                          {weeksArray.map((week, index) => {
                            const weekKey = format(week.start, 'yyyy-MM-dd');
                            const workload = employeeWorkload[employee.id][weekKey] || 0;
                            return (
                              <div
                                key={index}
                                className={cn(
                                  "w-8 h-8 shrink-0 flex items-center justify-center text-xs rounded",
                                  getCellColor(workload),
                                  isSameMonth(week.start, new Date()) 
                                    ? "ring-1 ring-blue-500/20" 
                                    : ""
                                )}
                                title={`Week of ${format(week.start, 'MMM d')}: ${workload}%`}
                              >
                                {workload > 0 && workload}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-muted/50 to-transparent pointer-events-none" />
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-muted/50 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-muted-foreground text-center py-4">
            No allocated employees
          </div>
        )}
      </div>
    );
  };

  const handleAllocationSubmit = async (employeeId: string, isEdit: boolean) => {
    if (!currentTenant || !projectId) return;

    const percentage = parseFloat(allocationFormData.allocation_percentage);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      toast({
        title: "Error",
        description: "Allocation percentage must be between 0 and 100.",
        variant: "destructive",
      });
      return;
    }

    try {
      const allocationData = {
        employee_id: employeeId,
        project_id: projectId,
        start_date: allocationFormData.start_date,
        end_date: allocationFormData.end_date,
        allocation_percentage: percentage,
        tenant_id: currentTenant.id
      };

      if (isEdit && editingAllocationId) {
        console.log('updating allocation', editingAllocationId, allocationData);
        const response = await updateAllocation(supabase, { id: editingAllocationId, ...allocationData });
        if (response) {
          toast({
            title: "Success",
            description: "Allocation updated successfully.",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update allocation.",
            variant: "destructive",
          });
        }
      } else {
        const response = await addAllocation(supabase, allocationData);
      }

      // Reset form and refresh data
      setAllocationFormData({
        start_date: '',
        end_date: '',
        allocation_percentage: '',
      });
      setEditingAllocationId(null);
      setAddingAllocationForEmployee(null);

      // Refresh allocated employees
      const { data: employees } = await supabase
        .from('Employees')
        .select(`
          id,
          given_name,
          surname,
          Allocations!inner (
            id,
            allocation_percentage,
            start_date,
            end_date
          )
        `)
        .eq('tenant_id', currentTenant.id)
        .eq('Allocations.project_id', projectId);

      if (employees) {
        setAllocatedEmployees(employees);
      }
    } catch (error) {
      console.error('Error saving allocation:', error);
      toast({
        title: "Error",
        description: "Failed to save allocation.",
        variant: "destructive",
      });
    }
  };

  const AllocationForm = ({ 
    employeeId, 
    isEdit = false, 
    currentAllocation = null 
  }: { 
    employeeId: string;
    isEdit?: boolean;
    currentAllocation?: any;
  }) => {
    return (
      <div className="mt-2 space-y-2 border-t pt-2">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={allocationFormData.start_date}
              onChange={(e) => setAllocationFormData(prev => ({ ...prev, start_date: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={allocationFormData.end_date}
              onChange={(e) => setAllocationFormData(prev => ({ ...prev, end_date: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="allocation_percentage">Allocation %</Label>
            <Input
              id="allocation_percentage"
              type="number"
              min="1"
              max="100"
              value={allocationFormData.allocation_percentage}
              onChange={(e) => setAllocationFormData(prev => ({ ...prev, allocation_percentage: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingAllocationId(null);
              setAddingAllocationForEmployee(null);
              setAllocationFormData({
                start_date: '',
                end_date: '',
                allocation_percentage: '',
              });
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => handleAllocationSubmit(employeeId, isEdit)}
          >
            {isEdit ? 'Update' : 'Add'} Allocation
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <main className="flex-1 p-8">
        <Card>
          <CardHeader>
            <CardTitle>{projectId ? 'Edit Project' : 'Add New Project'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="code">Project Code *</Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code || ''}
                    onChange={handleInputChange}
                    required
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    required
                    maxLength={255}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="client_id">Client *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSearchMode(!isSearchMode)}
                    >
                      {isSearchMode ? 'Show All' : 'Search Mode'}
                    </Button>
                  </div>
                  <ClientSelector />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    name="currency"
                    value={formData.currency || ''}
                    onChange={handleInputChange}
                    maxLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="contract_owner">Contract Owner *</Label>
                  <Input
                    id="contract_owner"
                    name="contract_owner"
                    value={formData.contract_owner || ''}
                    onChange={handleInputChange}
                    required
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label htmlFor="engagement_manager_email">Engagement Manager Email *</Label>
                  <Input
                    id="engagement_manager_email"
                    name="engagement_manager_email"
                    type="email"
                    value={formData.engagement_manager_email || ''}
                    onChange={handleInputChange}
                    required
                    maxLength={255}
                  />
                </div>
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="deal_status">Deal Status *</Label>
                  <Select 
                    name="deal_status" 
                    onValueChange={(value) => handleSelectChange('deal_status', value)} 
                    value={formData.deal_status || 'PENDING'}
                    required 
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select deal status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="WON">Won</SelectItem>
                      <SelectItem value="LOST">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <CustomCheckbox
                    id="billable"
                    label="Billable"
                    checked={formData.billable === 'true'}
                    onChange={(checked) => 
                      setFormData(prev => ({ ...prev, billable: checked.toString() }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="note">Note</Label>
                  <Input
                    id="note"
                    name="note"
                    value={formData.note || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="knowledges">Required Knowledge</Label>
                  <Popover open={knowledgeSearchOpen} onOpenChange={setKnowledgeSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={knowledgeSearchOpen}
                        className="w-full justify-between"
                      >
                        {selectedKnowledges.length === 0 
                          ? "Select required knowledge..." 
                          : `${selectedKnowledges.length} selected`}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search knowledge..." />
                        <CommandEmpty>No knowledge found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {knowledges.map((knowledge) => (
                            <CommandItem
                              key={knowledge.id}
                              value={knowledge.title}
                              onSelect={() => handleKnowledgeSelect(knowledge.id)}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "h-4 w-4 border rounded-sm flex items-center justify-center",
                                  selectedKnowledges.includes(knowledge.id) ? "bg-primary border-primary" : "border-input"
                                )}>
                                  {selectedKnowledges.includes(knowledge.id) && 
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                  }
                                </div>
                                {knowledge.title}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedKnowledges.map((knowledgeId) => {
                      const knowledge = knowledges.find(k => k.id === knowledgeId);
                      return knowledge ? (
                        <Badge
                          key={knowledge.id}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {knowledge.title}
                          <button
                            type="button"
                            className="ml-1 hover:bg-muted rounded-full"
                            onClick={(e) => {
                              e.preventDefault();
                              removeKnowledge(knowledge.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                {error && <div className="text-red-500 bg-red-100 p-2 rounded">{error}</div>}
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => router.push('/projects')}>Cancel</Button>
                  <Button type="submit">Submit</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      {projectId && ( // Only show in edit mode
        <div className="p-8">
          <Card>
            <CardHeader>
              <CardTitle>Allocated Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <AllocatedEmployees />
            </CardContent>
          </Card>
        </div>
      )}
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Employee Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeSuggestions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}