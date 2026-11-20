import { Metadata } from 'next';

import StateDoctorsScreen, {
  generateStateDoctorsMetadata,
  generateStateDoctorsStaticParams,
} from './screen';

type StateDoctorsPageProps = {
  params: Promise<{
    state: string;
  }>;
};

export const revalidate = 86_400;
export const dynamicParams = true;

export async function generateMetadata({ params }: StateDoctorsPageProps): Promise<Metadata> {
  return generateStateDoctorsMetadata({ params });
}

export async function generateStaticParams() {
  return generateStateDoctorsStaticParams();
}

export default function StateDoctorsPage({ params }: StateDoctorsPageProps) {
  return <StateDoctorsScreen params={params} />;
}
