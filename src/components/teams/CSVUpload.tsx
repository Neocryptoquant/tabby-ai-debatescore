import { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface CSVUploadProps {
  onTeamsUploaded: (teams: any[]) => void;
}

export const CSVUpload = ({ onTeamsUploaded }: CSVUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = `team_name,institution,speaker_1,speaker_2
Oxford A,Oxford University,John Smith,Jane Doe
Cambridge A,Cambridge University,Mike Johnson,Sarah Wilson
Harvard A,Harvard University,Robert Brown,Lisa Davis`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teams_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): any[] => {
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
    
    // Look for team name column
    const teamNameIndex = headers.findIndex(h => 
      h === 'team_name' || h === 'team name' || h === 'teamname' || h === 'team'
    );
    if (teamNameIndex !== -1) headerMap[headers[teamNameIndex]] = 'name';
    
    // Look for institution column
    const institutionIndex = headers.findIndex(h => 
      h === 'institution' || h === 'school' || h === 'university' || h === 'org'
    );
    if (institutionIndex !== -1) headerMap[headers[institutionIndex]] = 'institution';
    
    // Look for speaker 1 column
    const speaker1Index = headers.findIndex(h => 
      h === 'speaker_1' || h === 'speaker 1' || h === 'speaker1' || h === 'first speaker'
    );
    if (speaker1Index !== -1) headerMap[headers[speaker1Index]] = 'speaker_1';
    
    // Look for speaker 2 column
    const speaker2Index = headers.findIndex(h => 
      h === 'speaker_2' || h === 'speaker 2' || h === 'speaker2' || h === 'second speaker'
    );
    if (speaker2Index !== -1) headerMap[headers[speaker2Index]] = 'speaker_2';
    
    console.log("Header mapping:", headerMap);
    
    // Check if we have the minimum required headers
    if (!headerMap['name']) {
      throw new Error('Missing required column: team name');
    }

    const teams: any[] = [];
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
      
      // Create team object using the header mapping
      const team: Record<string, string> = {
        name: '',
        institution: '',
        speaker_1: '',
        speaker_2: ''
      };
      
      // Map values to the correct fields
      headers.forEach((header, index) => {
        if (headerMap[header] && index < values.length) {
          team[headerMap[header]] = values[index];
        }
      });
      
      console.log(`Parsed team:`, team);
      
      // Validate team
      if (!team.name) {
        errors.push(`Row ${i + 1}: Team name is required`);
        continue;
      }

      teams.push(team);
    }

    if (errors.length > 0) {
      setUploadErrors(errors);
    }

    return teams;
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
      console.log("CSV content:", text); // Debug log
      
      const teams = parseCSV(text);
      
      if (teams.length === 0) {
        toast.error('No valid teams found in CSV file');
        return;
      }

      console.log("Parsed teams:", teams); // Debug log
      onTeamsUploaded(teams);
      toast.success(`Successfully parsed ${teams.length} teams from CSV`);
      
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
          Bulk Team Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Upload teams in bulk using a CSV file. Download the template to see the required format.
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
          <p><strong>Required columns:</strong> team_name, institution, speaker_1, speaker_2</p>
          <p><strong>Format:</strong> CSV with comma-separated values</p>
          <p><strong>Note:</strong> First row should contain column headers</p>
        </div>
      </CardContent>
    </Card>
  );
};