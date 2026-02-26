import React from 'react';
import { Menu, Play, Save, Bell } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import toast from 'react-hot-toast';

const Header = ({ onMenuClick }) => {
  const { executeWorkflow, isExecuting, saveWorkflow } = useWorkflowStore();

  const handleExecute = async () => {
    try {
      await executeWorkflow();
      toast.success('Workflow executed successfully!');
    } catch (error) {
      toast.error('Execution failed: ' + error.message);
    }
  };

  const handleSave = () => {
    saveWorkflow();
    toast.success('Workflow saved!');
  };

  return (
    <header className="h-16 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">Workflow Builder</h2>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="btn-secondary flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save
        </button>

        <button 
          onClick={handleExecute}
          disabled={isExecuting}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${isExecuting ? 'animate-pulse' : ''}`} />
          {isExecuting ? 'Executing...' : 'Execute'}
        </button>

        <button className="p-2 hover:bg-dark-700 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
