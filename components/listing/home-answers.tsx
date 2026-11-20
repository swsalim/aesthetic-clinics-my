import Link from 'next/link';

import pluralize from 'pluralize';

import { getAllGuides } from '@/lib/guides';

import { getHeroStats } from '@/components/hero';
import JsonLd from '@/components/structured-data/json-ld';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

function formatCount(value: number) {
  return value.toLocaleString('en-MY');
}

const MMC_REGISTER = 'https://mmc.gov.my';
const MOH_AESTHETIC_REGISTRY =
  'https://www.moh.gov.my/en/core/health-information/national-registry-of-rmp-practising-aesthetic-medical-practice';

export async function HomeAnswers() {
  const guides = getAllGuides();
  const { clinicCount, doctorCount, stateCount, states, cities, chains } = await getHeroStats();

  const statesWithClinics = states.filter((state) => state.clinicCount > 0);
  const citiesWithClinics = cities;
  const groups = chains;
  const thinStates = states.filter((state) => state.clinicCount < 3);
  const topState = statesWithClinics[0];
  const topGroup = groups[0];
  const guideCount = guides.length;

  const clinicSentence =
    clinicCount > 0
      ? `${formatCount(clinicCount)} approved, active ${pluralize('clinic', clinicCount)} ${clinicCount === 1 ? 'is' : 'are'} listed`
      : 'Approved, active clinics are listed';
  const stateSentence =
    stateCount > 0
      ? `${formatCount(stateCount)} ${pluralize('state', stateCount)} ${stateCount === 1 ? 'has' : 'have'} at least one`
      : 'States with a listed clinic are linked from the browse page';

  const faqs: Array<{ question: string; answer: string }> = [
    {
      question: 'How many aesthetic clinics are listed in Malaysia?',
      answer:
        clinicCount > 0
          ? `${formatCount(clinicCount)}. That is the count of clinics with status approved and is_active true.`
          : 'The count is the number of clinics with status approved and is_active true, shown on the state pages.',
    },
    {
      question: 'How many states have a listed clinic?',
      answer:
        stateCount > 0
          ? `${formatCount(stateCount)}. A state is counted when it has at least one approved, active clinic.`
          : 'A state is counted when it has at least one approved, active clinic.',
    },
    {
      question: 'How many cities have a listed clinic?',
      answer:
        citiesWithClinics.length > 0
          ? `${formatCount(citiesWithClinics.length)}. Each city link is an area with at least one approved, active clinic.`
          : 'Each city page is an area with at least one approved, active clinic.',
    },
    {
      question: 'How many aesthetic doctors are listed?',
      answer:
        doctorCount > 0
          ? `${formatCount(doctorCount)} rows are in the doctor table. A row is a name and the qualification text stored with it, not a credential check.`
          : 'Doctor profiles are names and the qualification text stored with them, not a credential check.',
    },
    {
      question: 'Which state has the most listed clinics?',
      answer: topState
        ? `${topState.name} has ${formatCount(topState.clinicCount)} approved, active ${pluralize('clinic', topState.clinicCount)}.`
        : 'Open a state page for its approved, active clinic count.',
    },
    {
      question: 'Which states have fewer than 3 listed clinics?',
      answer:
        thinStates.length > 0
          ? thinStates
              .map((state) => `${state.name} (${formatCount(state.clinicCount)})`)
              .join(', ') + '.'
          : 'None of the states with a listed clinic are under 3.',
    },
    {
      question: 'Which clinic group has the most branches?',
      answer: topGroup
        ? `${topGroup.name} has ${formatCount(topGroup.branchCount)} ${pluralize('branch', topGroup.branchCount)} in this grouping.`
        : 'Clinic groups are listed on the chains page from approved, active clinic names.',
    },
    {
      question: 'How many clinic groups are listed?',
      answer:
        groups.length > 0
          ? `${formatCount(groups.length)}. Dr Chong, Dr Ko, Aglow and MyClinic are grouped by name. Any other name is grouped only when at least three approved, active listings share a leading name.`
          : 'Dr Chong, Dr Ko, Aglow and MyClinic are grouped by name. Any other name is grouped only when at least three approved, active listings share a leading name.',
    },
    {
      question: 'How many treatment guides are published?',
      answer: `${formatCount(guideCount)} ${pluralize('guide', guideCount)} ${guideCount === 1 ? 'is' : 'are'} published under Guides.`,
    },
    {
      question: 'Does a listing mean the doctor holds an aesthetic credential?',
      answer:
        'No. This directory does not check a Letter of Credentialing and Privileging. Check the doctor on the Malaysian Medical Council register and on the Ministry of Health national registry of registered medical practitioners practising aesthetic medical practice.',
    },
  ];

  return (
    <Wrapper className="border-t border-gray-200 dark:border-gray-800">
      <JsonLd id="home-faq-jsonld">
        {{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }}
      </JsonLd>
      <Container className="flex min-w-0 flex-col gap-10">
        <section className="flex min-w-0 flex-col gap-4">
          <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
            Where can I find an aesthetic clinic near me?
          </h2>
          <p className="max-w-3xl text-base text-gray-700 dark:text-gray-200">
            {clinicSentence}. {stateSentence}. Start with a state, then a city.
          </p>
          {statesWithClinics.length > 0 && (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {statesWithClinics.map((state) => (
                <li key={state.slug}>
                  <Link href={`/${state.slug}`} prefetch={false} className="font-medium">
                    Aesthetic clinics in {state.name} ({formatCount(state.clinicCount)})
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {citiesWithClinics.length > 0 && (
          <section className="flex min-w-0 flex-col gap-4">
            <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
              Cities with the most listed clinics
            </h2>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {citiesWithClinics.slice(0, 8).map((area) => (
                <li key={`${area.stateSlug}/${area.slug}`}>
                  <Link
                    href={`/${area.stateSlug}/${area.slug}`}
                    prefetch={false}
                    className="font-medium"
                  >
                    {area.name} ({formatCount(area.clinicCount)})
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="flex min-w-0 flex-col gap-4">
          <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
            How do I check an aesthetic doctor&apos;s credentials in Malaysia?
          </h2>
          <p className="max-w-3xl text-base text-gray-700 dark:text-gray-200">
            {doctorCount > 0
              ? `${formatCount(doctorCount)} doctor ${pluralize('profile', doctorCount)} ${doctorCount === 1 ? 'is' : 'are'} listed. A profile shows the name and the qualification text stored for that doctor. `
              : 'A doctor profile shows the name and the qualification text stored for that doctor. '}
            This directory does not check a Letter of Credentialing and Privileging. Look up the
            doctor on the{' '}
            <a href={MMC_REGISTER} rel="noopener noreferrer">
              Malaysian Medical Council register
            </a>{' '}
            and on the{' '}
            <a href={MOH_AESTHETIC_REGISTRY} rel="noopener noreferrer">
              Ministry of Health national registry of registered medical practitioners practising
              aesthetic medical practice
            </a>
            .
          </p>
          <p>
            <Link href="/doctors" prefetch={false} className="font-medium">
              Aesthetic doctors in Malaysia
            </Link>
          </p>
        </section>

        <section className="flex min-w-0 flex-col gap-4">
          <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
            Which aesthetic clinic groups have the most branches?
          </h2>
          <p className="max-w-3xl text-base text-gray-700 dark:text-gray-200">
            Groups are built from approved, active clinic names. Dr Chong, Dr Ko, Aglow and MyClinic
            are named groups. Any other name is grouped only when at least three listings share a
            leading name after the clinic&apos;s own city and state words are removed.
              {topGroup
              ? ` ${topGroup.name} has the most branches in this grouping (${formatCount(topGroup.branchCount)}).`
              : ''}
          </p>
          {groups.length > 0 && (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {groups.slice(0, 8).map((group) => (
                <li key={group.slug}>
                  <Link href={`/chains/${group.slug}`} prefetch={false} className="font-medium">
                    {group.name} ({formatCount(group.branchCount)}{' '}
                    {pluralize('branch', group.branchCount)})
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p>
            <Link href="/chains" prefetch={false} className="font-medium">
              All clinic groups
            </Link>
          </p>
        </section>

        <section className="flex min-w-0 flex-col gap-4">
          <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
            How are listings collected and checked?
          </h2>
          <p className="max-w-3xl text-base text-gray-700 dark:text-gray-200">
            A clinic sent through the public form is saved with status pending and source ugc_free.
            State, city and place pages list clinics whose status is approved and is_active is true.
            A page shows the name, place, hours, recorded services, doctor text and reviews that are
            stored for that clinic. It does not confirm a credential.
          </p>
          <p>
            <Link href="/submit" prefetch={false} className="font-medium">
              Submit a clinic
            </Link>
          </p>
        </section>

        <section className="flex min-w-0 flex-col gap-4">
          <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
            Questions about this directory
          </h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                open
                className="rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
              >
                <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                <p className="mt-2 text-gray-700 dark:text-gray-200">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </Container>
    </Wrapper>
  );
}
