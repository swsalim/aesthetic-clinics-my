import type * as React from 'react';

import { Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from './layout';

interface ReviewSubmissionAcknowledgmentEmailProps {
  authorName: string;
  clinicName: string;
  rating: number;
  reviewText: string;
}

export const ReviewSubmissionAcknowledgmentEmail = ({
  authorName,
  clinicName,
  rating,
  reviewText,
}: ReviewSubmissionAcknowledgmentEmailProps) => {
  return (
    <EmailLayout preview={`Thank you for your review of ${clinicName}`}>
      <Section className="mt-6">
        <Heading className="text-2xl font-bold text-gray-900">Thank You for Your Review!</Heading>

        <Text className="text-base text-gray-700">
          Dear <strong>{authorName}</strong>,
        </Text>

        <Text className="mt-4 text-base text-gray-700">
          Thank you for taking the time to share your experience with <strong>{clinicName}</strong>.
          We have received your review and appreciate your feedback.
        </Text>

        <Text className="mt-4 text-base text-gray-700">
          <strong>Your Review Details:</strong>
        </Text>

        <Text className="mt-2 text-base text-gray-700">
          <strong>Clinic:</strong> {clinicName}
        </Text>

        <Text className="mt-2 text-base text-gray-700">
          <strong>Rating:</strong> {rating}/5
        </Text>

        <Text className="mt-2 text-base text-gray-700">
          <strong>Your Review:</strong>
        </Text>
        <Text className="mt-2 text-base italic text-gray-700">&ldquo;{reviewText}&rdquo;</Text>

        <Text className="mt-6 text-base text-gray-700">
          Your review is currently being reviewed by our team and will be published on our website
          once it has been approved. This process typically takes 1-2 business days.
        </Text>

        <Text className="mt-4 text-base text-gray-700">
          Your feedback helps other patients make informed decisions about their dental care, and we
          truly value your contribution to our community.
        </Text>

        <Text className="mt-6 text-base text-gray-700">
          Best regards,
          <br />
          The Dental Clinic Malaysia Team
        </Text>
      </Section>
    </EmailLayout>
  );
};

ReviewSubmissionAcknowledgmentEmail.PreviewProps = {
  authorName: 'John Doe',
  clinicName: 'Aesthetic Clinic',
  rating: 4,
  reviewText: 'This is a great clinic!',
} satisfies ReviewSubmissionAcknowledgmentEmailProps;

export default ReviewSubmissionAcknowledgmentEmail;
