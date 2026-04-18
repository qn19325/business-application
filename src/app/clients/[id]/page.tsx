import { clients } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { TaxReturnCardProps } from './TaxReturnCard';
import Card from './TaxReturnCard';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const client = clients.find((cli) => cli.id === id);

  if (!client) {
    notFound();
  }

  return (
    <div>
      <p>
        {client.name} - {client.niNumber}
      </p>
      <div>
        {client.taxReturns.map((taxReturn) => {
          const taxReturnCardProps: TaxReturnCardProps = {
            ...taxReturn,
            name: client.name,
            deadline: taxReturn.deadline.toLocaleDateString('en-GB'),
          };
          return <Card key={taxReturn.id} {...taxReturnCardProps} />;
        })}
      </div>
      <div>Notes</div>
    </div>
  );
}
