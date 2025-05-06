
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserTable } from '@/components/admin/UserTable';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { Button } from '@/components/ui/button';
import { UserPlus, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'Admin') {
      toast.error('You do not have permission to access the user management page');
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="space-y-6 p-6">
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 mb-6 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-white flex items-center">
              <Users className="mr-3 h-6 w-6 text-blue-400" /> User Management
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Manage users and their permissions
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateUserOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>
      
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 transition-all">
        <UserTable />
      </div>

      <CreateUserDialog 
        open={isCreateUserOpen} 
        onOpenChange={setIsCreateUserOpen}
      />
    </div>
  );
};

export default UserManagement;
