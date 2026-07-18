import UserProfile from '../../components/UserProfile';
import { useStore } from '../../store/useStore';
export default function ProfilePage() {
  const user = useStore(s => s.user);
  return <UserProfile user={user} />;
}
