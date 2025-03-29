
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
import { Loader2 } from 'lucide-react';

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
    try {
      // Step 1: Create the startup record
      const { data: startup, error: startupError } = await supabase
        .from('startups')
        .insert({
          name: values.name,
          description: values.description || null,
          user_id: user.id,
          factors,
          score,
        })
        .select()
        .single();

      if (startupError) throw startupError;

      // Step 2: Upload the file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${startup.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pitch-decks')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL for the file
      const { data: publicUrl } = supabase.storage
        .from('pitch-decks')
        .getPublicUrl(filePath);

      // Step 3: Create the pitch deck record
      const { error: pitchDeckError } = await supabase
        .from('pitch_decks')
        .insert({
          startup_id: startup.id,
          file_name: file.name,
          file_url: publicUrl.publicUrl,
          analysis_results: {
            factors,
            score,
            explanations
          },
          analysis_complete: true
        });

      if (pitchDeckError) throw pitchDeckError;

      toast.success('Startup saved successfully!');
      onSaved();
    } catch (error: any) {
      console.error('Error saving startup:', error);
      toast.error('Failed to save startup', {
        description: error.message || 'Please try again later'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Save Your Startup</h3>
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
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default StartupForm;
