import { clients } from '@/lib/mock-data';
import { notFound } from 'next/navigation';

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
          return (
            <div key={taxReturn.id}>
              <div>PLACEHOLDER - TaxReturnCard.tsx</div>
              {taxReturn.checkList.map((item) => {
                return (
                  <div key={item.text}>
                    <div>{item.text}</div>
                    <div
                      className={`${item.received ? 'bg-green-500' : 'bg-red-500'} h-4 w-4`}
                    ></div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div>Notes</div>
    </div>
  );
}
