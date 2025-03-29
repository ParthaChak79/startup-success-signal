
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { SVIFactors } from '@/utils/sviCalculator';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  name: z.string().min(2, 'Startup name must be at least 2 characters'),
  description: z.string().optional(),
});

interface StartupFormProps {
  file: File;
  factors: SVIFactors;
  score: number;
  explanations?: Record<string, string>;
  onSaved: () => void;
}

const StartupForm = ({ file, factors, score, explanations, onSaved }: StartupFormProps) => {
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBucketError, setIsBucketError] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error('You must be logged in to save a startup');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setIsBucketError(false);
    
    try {
      // Step 1: Create the startup record
      // Convert factors to a plain object with primitive values for Supabase compatibility
      const factorsObject: Record<string, number> = {};
      Object.entries(factors).forEach(([key, value]) => {
        factorsObject[key] = Number(value);
      });
      
      const { data: startup, error: startupError } = await supabase
        .from('startups')
        .insert({
          name: values.name,
          description: values.description || null,
          user_id: user.id,
          factors: factorsObject,
          score: Number(score),
        })
        .select()
        .single();

      if (startupError) {
        if (startupError.message.includes('duplicate')) {
          throw new Error('A startup with this name already exists');
        }
        throw startupError;
      }

      if (!startup) {
        throw new Error('Failed to create startup record');
      }

      // Step 2: Upload the file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${startup.id}/${fileName}`;

      // Check if the bucket exists first
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error checking buckets:', bucketsError);
        throw new Error('Could not access storage');
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === 'pitch-decks');
      
      if (!bucketExists) {
        // Try to create the bucket if it doesn't exist
        console.log('Bucket does not exist, attempting to create it');
        const { error: createBucketError } = await supabase.storage
          .createBucket('pitch-decks', {
            public: true,
            fileSizeLimit: 20971520 // 20MB
          });
          
        if (createBucketError) {
          console.error('Error creating bucket:', createBucketError);
          setIsBucketError(true);
          throw new Error('Unable to create storage bucket. This is likely a permissions issue. Your startup has been saved, but the file could not be uploaded.');
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('pitch-decks')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        
        // Check for specific error types
        if (uploadError.message.includes('bucket') || uploadError.message.includes('policy')) {
          setIsBucketError(true);
          throw new Error('Storage permission issue. Your startup has been saved, but the file could not be uploaded.');
        }
        
        // Check if it's a file size issue
        if (uploadError.message.includes('size')) {
          throw new Error('File is too large. Maximum size is 20MB.');
        }
        
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      // Get the public URL for the file
      const { data: publicUrl } = supabase.storage
        .from('pitch-decks')
        .getPublicUrl(filePath);

      if (!publicUrl || !publicUrl.publicUrl) {
        throw new Error('Could not generate public URL for the file');
      }

      // Step 3: Create the pitch deck record
      // Transform explanations to ensure it's compatible with Supabase
      const processedExplanations: Record<string, string> = {};
      if (explanations) {
        Object.entries(explanations).forEach(([key, value]) => {
          processedExplanations[key] = String(value);
        });
      }

      const analysisResults = {
        factors: factorsObject,
        score: Number(score),
        explanations: processedExplanations
      };
      
      const { error: pitchDeckError } = await supabase
        .from('pitch_decks')
        .insert({
          startup_id: startup.id,
          file_name: file.name,
          file_url: publicUrl.publicUrl,
          analysis_results: analysisResults,
          analysis_complete: true
        });

      if (pitchDeckError) {
        console.error('Error creating pitch deck record:', pitchDeckError);
        // Even if the pitch deck record fails, the startup was saved
        toast.success('Startup saved successfully, but there was an issue with the pitch deck record.');
        onSaved();
        return;
      }

      toast.success('Startup and pitch deck saved successfully!');
      onSaved();
    } catch (error: any) {
      console.error('Error saving startup:', error);
      
      // Set the error message to display
      setError(error.message || 'There was a problem saving your startup');
      
      // Show toast error with more specific message based on error type
      if (error.message.includes('duplicate')) {
        toast.error('A startup with this name already exists');
      } else if (isBucketError) {
        toast.error('Storage issue detected', {
          description: 'Your startup was saved but the file could not be uploaded due to storage permission issues.'
        });
      } else {
        toast.error('There was a problem saving your startup', {
          description: error.message || 'Please try again later'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Save Your Startup</h3>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Startup Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your startup name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Briefly describe your startup" 
                    className="resize-y min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Startup'
              )}
            </Button>
            
            {isBucketError && (
              <p className="text-xs text-amber-600 mt-2">
                Note: Your startup information will be saved, but there might be issues with file storage. 
                The administrator should check storage bucket permissions.
              </p>
            )}
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default StartupForm;
