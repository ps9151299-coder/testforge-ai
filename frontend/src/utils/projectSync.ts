export const syncProjectStats = (
  projectId: string,
  requirementsCount: number,
  testCasesCount: number
) => {
  const currentUser = localStorage.getItem('current_user') || 'default_user';
  const storageKey = `testforge_projects_${currentUser}`;

  const saved = localStorage.getItem(storageKey);
  if (!saved) return;

  try {
    const projects = JSON.parse(saved);
    const updated = projects.map((p: any) => {
      if (p.id === projectId) {
        return {
          ...p,
          requirementsCount: Math.max(p.requirementsCount || 0, requirementsCount),
          testCasesCount: Math.max(p.testCasesCount || 0, testCasesCount),
        };
      }
      return p;
    });
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to sync project stats:', err);
  }
};