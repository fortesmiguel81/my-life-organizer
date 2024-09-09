import { v4 as uuidv4 } from 'uuid';
import { Payment, columns } from './_components/columns';
import { DataTable } from './_components/transactions-table';

async function getData(): Promise<Payment[]> {
  const categories = [
    'Food',
    'Utilities',
    'Transportation',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Education',
    'Clothing',
  ];
  const payees = [
    'Demo Company',
    'Utility Company',
    'Transport Service',
    'Streaming Service',
    'Local Clinic',
    'Online Store',
    'Bookstore',
    'Clothing Retail',
  ];
  const accounts = [
    'Savings Account',
    'Checking Account',
    'Credit Account',
    'Debit Account',
    'Health Savings Account',
    'Electronic Wallet',
    'Student Account',
    'Gift Card',
  ];

  const additionalData = [];
  for (let i = 0; i < 50; i++) {
    additionalData.push({
      id: uuidv4(),
      date: getRandomDate(new Date(4, 1, 1), new Date(2024, 12, 31)),
      amount: getRandomInt(-1000, 1000),
      category: categories[i % categories.length],
      shortDescription: `Transaction ${i}`,
      longDescription: `This is a long description for transaction ${i}`,
      payee: payees[i % payees.length],
      account: accounts[i % accounts.length],
    });
  }

  return additionalData;
}

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomDate = (startDate: Date, endDate: Date): Date => {
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();
  const randomTimestamp =
    Math.random() * (endTimestamp - startTimestamp) + startTimestamp;
  return new Date(randomTimestamp);
};

export default async function TransactionsPage() {
  const data = await getData();

  return (
    <div className='w-full'>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
