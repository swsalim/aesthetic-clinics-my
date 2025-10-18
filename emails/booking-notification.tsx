import type * as React from 'react';

import { Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from './layout';

interface BookingNotificationEmailProps {
  clinicName?: string;
  customerName: string;
  contact: string;
  treatment: string;
  treatmentDate: Date;
  message: string;
  url: string;
}

const TREATMENT_LABELS: Record<string, string> = {
  general: 'General',
  tooth_extraction: 'Tooth Extraction',
  tooth_whitening: 'Tooth Whitening',
  dental_filling: 'Aesthetic Filling',
  scaling_polishing: 'Scaling and Polishing',
  wisdom_teeth_removal: 'Wisdom Teeth Removal',
  dental_implant: 'Aesthetic Implant',
  root_canal_treatment: 'Root Canal Treatment',
  crowning_bridges: 'Crowning and Bridges',
};

export const BookingNotificationEmail = ({
  clinicName,
  customerName,
  contact,
  treatment,
  treatmentDate,
  message,
  url,
}: BookingNotificationEmailProps) => {
  const treatmentLabel = TREATMENT_LABELS[treatment] || treatment;

  return (
    <EmailLayout preview={`New Appointment Booking Request`}>
      <Section className="mt-6">
        <Heading className="text-2xl font-bold text-gray-900">
          New Appointment Booking Request
        </Heading>
        <Text className="text-base text-gray-700">
          A new booking request has been submitted for{' '}
          <strong>{clinicName ? clinicName : 'a clinic'}</strong>
        </Text>

        <Text className="mt-4 text-base text-gray-700">
          <strong>Customer Name:</strong> {customerName}
        </Text>

        <Text className="mt-2 text-base text-gray-700">
          <strong>Contact:</strong> {contact}
        </Text>

        <Text className="mt-2 text-base text-gray-700">
          <strong>Treatment Date:</strong> {new Date(treatmentDate).toLocaleDateString()}
        </Text>

        <Text className="mt-2 text-base text-gray-700">
          <strong>Treatment:</strong> {treatmentLabel}
        </Text>

        <Text className="mt-2 text-base text-gray-700">
          <strong>Url:</strong> {url}
        </Text>

        <Text className="mt-4 text-base text-gray-700">
          <strong>Message:</strong>
        </Text>
        <Text className="mt-2 text-base text-gray-700">{message}</Text>
      </Section>
    </EmailLayout>
  );
};

BookingNotificationEmail.PreviewProps = {
  clinicName: 'Aesthetic Clinic',
  customerName: 'John Doe',
  contact: '+60123456789',
  treatment: 'general',
  treatmentDate: new Date('2025-01-01'),
  message: 'I would like to book an appointment for a general checkup.',
  url: 'https://aestheticclinics.my/place/sample-clinic',
} satisfies BookingNotificationEmailProps;

export default BookingNotificationEmail;
