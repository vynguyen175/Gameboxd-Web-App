import { useMemo } from 'react';

const MATURE_GENRES = ['Mature', 'Sexual Content', 'Extreme Violence', 'Gore', 'Horror'];

export function useAgeRestriction(user) {
  const isMinor = useMemo(() => {
    if (!user?.dateOfBirth) return false;
    const dob = new Date(user.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age < 18;
  }, [user?.dateOfBirth]);

  const filterMatureContent = useMemo(() => {
    if (!isMinor) return (reviews) => reviews;
    return (reviews) => reviews.filter(r => !MATURE_GENRES.includes(r.genre));
  }, [isMinor]);

  return { isMinor, filterMatureContent, MATURE_GENRES };
}

export { MATURE_GENRES };
export default useAgeRestriction;
