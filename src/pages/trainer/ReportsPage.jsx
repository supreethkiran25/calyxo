import TrainerReports from '../../components/TrainerReports';
import { useStore } from '../../store/useStore';
export default function ReportsPage() {
  const user = useStore(s => s.user);
  const clients = useStore(s => s.trainerClients);
  return <TrainerReports user={user} clients={clients} />;
}
