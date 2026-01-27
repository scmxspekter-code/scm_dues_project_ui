import * as yup from 'yup';
export const memberSchema = yup.object({
  name: yup.string().required('Name is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  amount: yup.number().positive('Amount must be positive').required('Amount is required'),
  currency: yup.string().required('Currency is required'),
  dueDate: yup.string().required('Due date is required'),
  paymentStatus: yup
    .mixed<'pending' | 'processing' | 'paid' | 'failed'>()
    .oneOf(['pending', 'processing', 'paid', 'failed'])
    .required('Payment status is required'),
  reminderFrequency: yup.string().required('Reminder frequency is required'),
});
