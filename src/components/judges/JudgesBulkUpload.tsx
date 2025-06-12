import { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ExperienceLevel } from '@/types/tournament';

interface JudgeData {
  name: string;
  institution?: string;
  experience_level: ExperienceLevel;
}

interface JudgesBulkUploadProps {
  onJudgesUploaded: (judges: JudgeData[]) => void;
}

export const JudgesBulkUpload = ({ onJudgesUploaded }: JudgesBulkUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = `name,institution,experience_level
John Smith,Oxford University,novice
Jane Doe,Cambridge University,intermediate
Robert Brown,Harvard University,open
Lisa Davis,Stanford University,pro`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'judges_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): JudgeData[] => {
    console.log("Parsing CSV:", text);
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      console.error("Not enough lines in CSV");
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    console.log("Headers:", headers);
    
    // Map headers to standardized field names
    const headerMap: Record<string, string> = {};
    
    // Look for name column
    const nameIndex = headers.findIndex(h => 
      h === 'name' || h === 'judge name' || h === 'judge' || h === 'full name'
    );
    if (nameIndex !== -1) headerMap[headers[nameIndex]] = 'name';
    
    // Look for institution column
    const institutionIndex = headers.findIndex(h => 
      h === 'institution' || h === 'school' || h === 'university' || h === 'org'
    );
    if (institutionIndex !== -1) headerMap[headers[institutionIndex]] = 'institution';
    
    // Look for experience level column
    const experienceIndex = headers.findIndex(h => 
      h === 'experience_level' || h === 'experience' || h === 'level' || h === 'exp'
    );
    if (experienceIndex !== -1) headerMap[headers[experienceIndex]] = 'experience_level';
    
    console.log("Header mapping:", headerMap);
    
    // Check if we have the minimum required headers
    if (nameIndex === -1) {
      throw new Error('Missing required column: name');
    }

    const judges: JudgeData[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Handle CSV parsing with quotes and commas
      const row = lines[i];
      let values: string[] = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < row.length; j++) {
        const char = row[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Add the last value
      values.push(currentValue);
      
      // Trim all values
      values = values.map(v => v.trim());
      
      console.log(`Row ${i} values:`, values);
      
      // Create judge object using the header mapping
      const judge: Record<string, string> = {
        name: '',
        institution: '',
        experience_level: 'novice'
      };
      
      // Map values to the correct fields
      headers.forEach((header, index) => {
        if (headerMap[header] && index < values.length) {
          judge[headerMap[header]] = values[index];
        }
      });
      
      console.log(`Parsed judge:`, judge);
      
      // Validate judge
      if (!judge.name) {
        errors.push(`Row ${i + 1}: Judge name is required`);
        continue;
      }

      // Validate experience level
      const validExperienceLevels: ExperienceLevel[] = ['novice', 'intermediate', 'open', 'pro'];
      if (judge.experience_level && !validExperienceLevels.includes(judge.experience_level as ExperienceLevel)) {
        judge.experience_level = 'novice'; // Default to novice if invalid
        errors.push(`Row ${i + 1}: Invalid experience level for ${judge.name}, defaulting to novice`);
      }

      judges.push(judge as JudgeData);
    }

    if (errors.length > 0) {
      setUploadErrors(errors);
    }

    return judges;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setIsProcessing(true);
    setUploadErrors([]);

    try {
      const text = await file.text();
      console.log("CSV content:", text);
      
      const judges = parseCSV(text);
      
      if (judges.length === 0) {
        toast.error('No valid judges found in CSV file');
        return;
      }

      console.log("Parsed judges:", judges);
      onJudgesUploaded(judges);
      toast.success(`Successfully parsed ${judges.length} judges from CSV`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error(error instanceof Error ? error.message : 'Error parsing CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Judge Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Upload judges in bulk using a CSV file. Download the template to see the required format.
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Upload CSV'}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {uploadErrors.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Upload Issues:</p>
                <ul className="text-sm space-y-1">
                  {uploadErrors.slice(0, 5).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {uploadErrors.length > 5 && (
                    <li>• ... and {uploadErrors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Required columns:</strong> name</p>
          <p><strong>Optional columns:</strong> institution, experience_level</p>
          <p><strong>Valid experience levels:</strong> novice, intermediate, open, pro</p>
          <p><strong>Format:</strong> CSV with comma-separated values</p>
          <p><strong>Note:</strong> First row should contain column headers</p>
        </div>
      </CardContent>
    </Card>
  );
};