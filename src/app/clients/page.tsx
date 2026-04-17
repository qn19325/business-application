import { clients } from '@/lib/mock-data';
import ClientListItem from './ClientListItem';

export default async function Page() {
  return (
    <div>
      {clients.map((client) => {
        return <ClientListItem key={client.id} {...client} />;
      })}
    </div>
  );
}
