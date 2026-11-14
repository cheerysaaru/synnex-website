/* The five steps every client job moves through (shared by /track and /admin). */
export const JOB_STEPS = ['Quote approved', 'Site visit', 'Installation', 'Testing', 'Handover'];

export const stepState = (index, completed) => {
  if (index < completed) return 'done';
  if (index === completed) return 'now';
  return 'next';
};

export const formatStepDate = (value) => {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
