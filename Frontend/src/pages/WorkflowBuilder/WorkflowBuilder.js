import React, { useState } from 'react';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import ExecutionLog from '../../components/ExecutionLog/ExecutionLog';

const WorkflowBuilder = () => {
  const [showLog, setShowLog] = useState(true);

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex overflow-hidden">
          <WorkflowCanvas />
        </div>
        {showLog && <ExecutionLog onClose={() => setShowLog(false)} />}
      </div>
    </div>
  );
};

export default WorkflowBuilder;
