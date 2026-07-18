import TrainerWorkoutBuilder from '../../components/TrainerWorkoutBuilder';
import { useStore } from '../../store/useStore';
export default function WorkoutsPage() {
  const user = useStore(s => s.user);
  return <TrainerWorkoutBuilder user={user} />;
}
