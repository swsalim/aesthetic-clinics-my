import type * as React from 'react';

import { Container, Heading, Hr, Link, Text } from '@react-email/components';

import { EmailLayout } from './layout';

interface ClinicSubmissionEmailProps {
  clinicName: string;
  price: string;
  recipientName?: string;
}

export const ClinicSubmissionEmail = ({
  clinicName,
  price,
  recipientName = 'Partner',
}: ClinicSubmissionEmailProps) => {
  const isPremium = price === 'instant';
  const processingTime = isPremium ? 'within 24 hours' : 'within 6 months';
  const statusIcon = isPremium ? '✅' : '⏳';
  const priceText = isPremium ? 'Instant Premium Listing (MYR 199)' : 'Standard Listing (Free)';

  return (
    <EmailLayout preview={`Thank you for your ${clinicName} listing submission`}>
      <Container className="px-6 py-4">
        <Heading className="mb-2 text-2xl font-bold text-gray-900">
          Thank You for Your Aesthetic Clinic Listing Submission
        </Heading>

        <Text className="text-base text-gray-700">Dear {recipientName},</Text>

        <Text className="text-base font-bold text-gray-700">
          Thank you for submitting your {clinicName} listing to AestheticClinics.my!
        </Text>

        <Hr className="my-4 border-gray-300" />

        <Heading className="mb-2 mt-0 text-lg font-bold text-gray-800">
          Your Submission Status:
        </Heading>

        <Container className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <Text className="text-base font-bold text-gray-800">
            {statusIcon} {priceText}
          </Text>
          <Text className="text-base text-gray-700">
            Your listing will be live on our platform {processingTime}.
            {!isPremium &&
              ' Due to high submission volume, standard listings require longer processing times.'}
          </Text>
        </Container>

        <Text className="mt-4 text-base text-gray-700">
          Our team will notify you via email once your listing is live or if we need additional
          information.
        </Text>

        <Hr className="my-4 border-gray-300" />

        <Heading className="mb-2 text-lg font-bold text-gray-800">Questions or Concerns?</Heading>

        <Text className="text-base text-gray-700">
          Please contact our support team at{' '}
          <Link href="mailto:hello@aestheticclinics.my" className="text-blue-600">
            hello@aestheticclinics.my
          </Link>
        </Text>

        <Text className="mt-6 text-base text-gray-700">
          Thank you for choosing AestheticClinics.my as your partner in connecting with patients.
        </Text>

        <Text className="text-base text-gray-700">
          Warm regards,
          <br />
          The AestheticClinics.my Team
        </Text>
      </Container>
    </EmailLayout>
  );
};

ClinicSubmissionEmail.PreviewProps = {
  clinicName: 'Aesthetic Clinic',
  price: 'free',
  recipientName: 'John Wick',
} satisfies ClinicSubmissionEmailProps;

export default ClinicSubmissionEmail;
