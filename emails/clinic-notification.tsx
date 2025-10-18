import type * as React from 'react';

import { Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from './layout';

interface ClinicNotificationEmailProps {
  name: string;
  clinicName: string;
  email?: string;
  clinicEmail?: string;
  phone: string;
  address: string;
  description: string;
  price: string;
}

export const ClinicNotificationEmail = ({
  name,
  clinicName,
  email,
  clinicEmail,
  phone,
  address,
  description,
  price,
}: ClinicNotificationEmailProps) => {
  return (
    <EmailLayout preview={`New Listing Submission: ${clinicName}`}>
      <Section className="mt-6">
        <Heading className="text-2xl font-bold text-gray-900">New Listing Submission</Heading>
        <Text className="text-base text-gray-700">
          A new listing has been submitted for <strong>{clinicName}</strong>
        </Text>

        <Text className="mt-4 text-base text-gray-700">
          <strong>Submitted by:</strong> {name} {email && `(${email})`}
        </Text>

        <Text className="mt-2 text-base text-gray-700">
          <strong>Email:</strong> {clinicEmail}
        </Text>

        <Text className="mt-2 text-base text-gray-700">
          <strong>Phone:</strong> {phone}
        </Text>

        <Text className="mt-2 text-base text-gray-700">
          <strong>Address:</strong> {address}
        </Text>

        <Text className="mt-2 text-base text-gray-700">
          <strong>Description:</strong> {description}
        </Text>

        <Text className="mt-2 text-base text-gray-700">
          <strong>Listing Type:</strong>{' '}
          {price === 'instant' ? 'Instant Listing' : 'Free Listing ($0)'}
        </Text>
      </Section>
    </EmailLayout>
  );
};

ClinicNotificationEmail.PreviewProps = {
  name: 'John Doe',
  clinicName: 'Aesthetic Clinic',
  email: 'john.doe@example.com',
  phone: '1234567890',
  address: '123 Main St, Anytown, USA',
  description: 'This is a description of the clinic',
  price: '100',
} satisfies ClinicNotificationEmailProps;

export default ClinicNotificationEmail;
