// Dashboard-specific entry point
// This file should only be imported by dashboard pages

export { default as DashboardHeader } from './dashboard-header';
export { Calendar } from './calendar';
export { Command } from './command';

// Re-export editor components
export { default as Editor } from '../editor';

// Dashboard-specific utilities
export const dashboardUtils = {
  // Add dashboard-specific utility functions here
  formatDate: (date: Date) => date.toLocaleDateString(),
  // ... other dashboard utilities
};
