import Container from '../ui/container';
import { Wrapper } from '../ui/wrapper';
import { RecentClinicsList } from './recent-clinics-list';

export function RecentClinics() {
  return (
    <Wrapper>
      <Container>
        <div className="mb-10 flex flex-col gap-2 text-center md:mb-12">
          <h2 className="text-balance text-3xl font-black">
            Discover best aesthetic clinics near you
          </h2>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-300">
            Browse verified reviews, clinic hours, and contact details to book your visit.
          </p>
        </div>
        <RecentClinicsList />
      </Container>
    </Wrapper>
  );
}
