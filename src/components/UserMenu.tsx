
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, FileText, Plus, Settings } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const UserMenu = () => {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('You have been signed out');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user?.email}</p>
          <p className="text-xs text-muted-foreground">User</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/my-startups')} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          <span>My Startups</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/pitch-deck-analysis')} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          <span>New Analysis</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
