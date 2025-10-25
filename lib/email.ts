import { BookingNotificationEmail } from '@/emails/booking-notification';
import { ClinicNotificationEmail } from '@/emails/clinic-notification';
import { ClinicSubmissionEmail } from '@/emails/clinic-submission';
import { ReviewNotificationEmail } from '@/emails/review-notification';
import { ReviewSubmissionAcknowledgmentEmail } from '@/emails/review-submission-acknowledgment';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email template for new review notifications
export const sendNewReviewNotification = async ({
  clinicName,
  authorName,
  email,
  rating,
  reviewText,
}: {
  clinicName: string;
  authorName: string;
  email: string;
  rating: number;
  reviewText: string;
}) => {
  if (!resend) {
    console.info('RESEND_API_KEY is not set in the .env. Skipping sending email.');
    return;
  }

  try {
    const { error } = await resend.batch.send([
      {
        from: process.env.EMAIL_FROM || 'hello@aestheticclinics.my',
        to: email,
        subject: `Thank you for your review of ${clinicName}`,
        react: ReviewSubmissionAcknowledgmentEmail({
          clinicName,
          authorName,
          rating,
          reviewText,
        }),
      },
      {
        from: process.env.EMAIL_FROM || 'hello@aestheticclinics.my',
        to: process.env.NOTIFICATION_EMAIL || 'admin@aestheticclinics.my',
        subject: `New Review for ${clinicName}`,
        react: ReviewNotificationEmail({
          clinicName,
          authorName,
          rating,
          reviewText,
        }),
      },
    ]);

    // const { error } = await resend.emails.send({
    //   from: process.env.EMAIL_FROM || 'hello@aestheticclinics.my',
    //   to: email,
    //   //   bcc: [process.env.NOTIFICATION_EMAIL || 'hello@aestheticclinics.my'],
    //   bcc: ['yuyu@clinicgeek.com'],
    //   subject: `New Review for ${clinicName}`,
    //   react: ReviewNotificationEmail({
    //     clinicName,
    //     authorName,
    //     rating,
    //     reviewText,
    //   }),
    // });

    if (error) {
      console.error('Error sending email notification:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception when sending email:', error);
    return { success: false, error };
  }
};

// Email template for review submission acknowledgment
export const sendReviewSubmissionAcknowledgment = async ({
  authorName,
  email,
  clinicName,
  rating,
  reviewText,
}: {
  authorName: string;
  email: string;
  clinicName: string;
  rating: number;
  reviewText: string;
}) => {
  if (!resend) {
    console.info('RESEND_API_KEY is not set in the .env. Skipping sending email.');
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'hello@aestheticclinics.my',
      to: email,
      subject: `Thank you for your review of ${clinicName}`,
      react: ReviewSubmissionAcknowledgmentEmail({
        authorName,
        clinicName,
        rating,
        reviewText,
      }),
    });

    if (error) {
      console.error('Error sending review acknowledgment email:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception when sending review acknowledgment email:', error);
    return { success: false, error };
  }
};

// Email template for new clinic submissions
export const sendNewClinicNotification = async ({
  name,
  email,
  clinicName,
  clinicEmail,
  phone,
  address,
  description,
  price,
}: {
  name: string;
  email: string;
  clinicName: string;
  clinicEmail?: string;
  phone: string;
  address: string;
  description: string;
  price: string;
}) => {
  if (!resend) {
    console.info('RESEND_API_KEY is not set in the .env. Skipping sending email.');
    return;
  }

  try {
    const subject =
      price === 'instant'
        ? 'Your Premium Aesthetic Clinic Listing: Live Within 24 Hours'
        : 'Aesthetic Clinic Listing Received - Processing Confirmation';
    const { error } = await resend.batch.send([
      {
        from: process.env.EMAIL_FROM || 'hello@aestheticclinics.my',
        to: email,
        subject,
        react: ClinicSubmissionEmail({
          recipientName: name,
          clinicName,
          price,
        }),
      },
      {
        from: process.env.EMAIL_FROM || 'hello@aestheticclinics.my',
        to: process.env.NOTIFICATION_EMAIL || 'admin@aestheticclinics.my',
        subject,
        react: ClinicNotificationEmail({
          name,
          email,
          clinicName,
          clinicEmail,
          phone,
          address,
          description,
          price,
        }),
      },
    ]);

    if (error) {
      console.error('Error sending clinic notification:', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (error) {
    console.error('Exception when sending clinic notification:', error);
    return { success: false, error };
  }
};

// Email template for new booking notifications
export const sendNewBookingNotification = async ({
  clinicName,
  customerName,
  contact,
  treatment,
  treatmentDate,
  message,
  url,
}: {
  clinicName?: string;
  customerName: string;
  contact: string;
  treatment: string;
  treatmentDate: Date;
  message: string;
  url: string;
}) => {
  if (!resend) {
    console.info('RESEND_API_KEY is not set in the .env. Skipping sending email.');
    return;
  }

  try {
    const { error } = await resend.batch.send([
      {
        from: process.env.EMAIL_FROM || 'hello@aestheticclinics.my',
        to: process.env.NOTIFICATION_EMAIL || 'admin@aestheticclinics.my',
        subject: `New Appointment Booking Request`,
        react: BookingNotificationEmail({
          clinicName,
          customerName,
          contact,
          treatment,
          treatmentDate,
          message,
          url,
        }),
      },
    ]);

    if (error) {
      console.error('Error sending booking notification:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception when sending booking notification:', error);
    return { success: false, error };
  }
};
