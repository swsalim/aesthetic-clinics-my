import type * as React from 'react';

import { Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from './layout';

interface ReviewNotificationEmailProps {
  clinicName: string;
  authorName: string;
  rating: number;
  reviewText: string;
}

export const ReviewNotificationEmail = ({
  clinicName,
  authorName,
  rating,
  reviewText,
}: ReviewNotificationEmailProps) => {
  return (
    <EmailLayout preview={`New Review for ${clinicName}`}>
      <Section className="mt-6">
        <Heading className="text-2xl font-bold text-gray-900">New Review Received</Heading>
        <Text className="text-base text-gray-700">
          A new review has been submitted for <strong>{clinicName}</strong>
        </Text>

        <Text className="mt-4 text-base text-gray-700">
          <strong>Reviewer:</strong> {authorName}
        </Text>

        <Text className="mt-2 text-base text-gray-700">
          <strong>Rating:</strong> {rating}/5
        </Text>

        <Text className="mt-4 text-base text-gray-700">
          <strong>Review:</strong>
        </Text>
        <Text className="mt-2 text-base text-gray-700">{reviewText}</Text>
      </Section>
    </EmailLayout>
  );
};

ReviewNotificationEmail.PreviewProps = {
  clinicName: 'Aesthetic Clinic',
  authorName: 'John Doe',
  rating: 4,
  reviewText: 'This is a great clinic!',
} satisfies ReviewNotificationEmailProps;

export default ReviewNotificationEmail;
