import TrainerNutritionBuilder from '../../components/TrainerNutritionBuilder';
import { useStore } from '../../store/useStore';
export default function NutritionPage() {
  const user = useStore(s => s.user);
  return <TrainerNutritionBuilder user={user} />;
}
