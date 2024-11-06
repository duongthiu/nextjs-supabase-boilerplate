import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AutocompleteItem {
  id: string;
  name: string;
}

interface AutocompleteProps {
  options?: AutocompleteItem[];
  formData?: any;
  setFormData: (data: any) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
  fieldName?: string;
}

const Autocomplete = ({ 
  options = [], 
  formData = { selectedId: '' },
  setFormData, 
  onError, 
  isLoading = false,
  fieldName = 'selectedId'
}: AutocompleteProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter clients based on search term with null check
  const filteredOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options.filter(option =>
      option?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSelectionChange = (selectedId: string) => {
    try {
      setFormData((prevData: any) => ({
        ...prevData,
        [fieldName]: selectedId
      }));
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const selectedValue = formData[fieldName as keyof typeof formData] || "";

  return (
    <div className="w-full">
      <Select 
        value={selectedValue}
        onValueChange={handleSelectionChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <SelectItem
                key={option.id}
                value={option.id}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {option.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-results" disabled>
              {isLoading ? "Loading clients..." : "No clients found"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default Autocomplete;
