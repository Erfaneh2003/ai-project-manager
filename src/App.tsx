import React from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Header } from './components/layout/Header';
import { SidebarNav } from './components/layout/SidebarNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { CreateProjectView } from './components/projects/CreateProjectView';
import { SchedulerView } from './components/scheduler/SchedulerView';
import { TeamManagementView } from './components/team/TeamManagementView';
import { TaskAllocationModal } from './components/tasks/TaskAllocationModal';
import { TaskEditModal } from './components/tasks/TaskEditModal';

const AppContent: React.FC = () => {
  const { activeTab, theme, language } = useProject();

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen font-sans`} dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
        {/* Top Bar Navigation */}
        <Header />

        {/* Workspace Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation */}
          <SidebarNav />

          {/* Active View Content */}
          <main className="flex-1 flex overflow-hidden bg-slate-50/50 dark:bg-slate-950">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'create_project' && <CreateProjectView />}
            {activeTab === 'scheduler' && <SchedulerView />}
            {activeTab === 'team' && <TeamManagementView />}
          </main>
        </div>

        {/* Global Agent & Task Modals */}
        <TaskAllocationModal />
        <TaskEditModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}
