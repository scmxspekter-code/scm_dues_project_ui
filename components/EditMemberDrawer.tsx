import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { X, User, Phone, DollarSign, Calendar, CreditCard, Bell } from 'lucide-react';
import { Formik, FormikProps } from 'formik';
import { useMembers } from '@/hooks/useMembers';
import { Input } from './Input';
import { CustomSelect } from './CustomSelect';
import { DatePicker } from './DatePicker';
import { NumberInput } from './NumberInput';
import { memberSchema } from '@/schemas/member.schema';
import { Currency, PaymentStatus, ReminderFrequency, Member } from '@/types';

interface MemberFormValues {
  name: string;
  phoneNumber: string;
  amount: number | null;
  currency: Currency;
  dueDate: string;
  paymentStatus: PaymentStatus;
  reminderFrequency: ReminderFrequency;
}

interface EditMemberDrawerProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

const DURATION = 0.25;
const EASE_OUT = 'power2.out';
const EASE_IN = 'power2.in';

export const EditMemberDrawer: React.FC<EditMemberDrawerProps> = ({
  member,
  isOpen: isEditDrawerOpen,
  onClose: closeEditDrawer,
}) => {
  const { updateMember, apiState } = useMembers();
  const formikRef = useRef<FormikProps<MemberFormValues> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isEditDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isEditDrawerOpen]);

  // Enter animation
  useEffect(() => {
    if (!isEditDrawerOpen) return;
    const o = overlayRef.current;
    const p = panelRef.current;
    if (!o || !p) return;
    gsap.fromTo(o, { opacity: 0 }, { opacity: 1, duration: DURATION, ease: EASE_OUT });
    gsap.fromTo(p, { x: '100%' }, { x: 0, duration: DURATION, ease: EASE_OUT });
  }, [isEditDrawerOpen]);

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    const o = overlayRef.current;
    const p = panelRef.current;
    if (!o || !p) {
      closeEditDrawer();
      return;
    }
    isClosingRef.current = true;
    gsap.to(o, { opacity: 0, duration: DURATION, ease: EASE_IN });
    gsap.to(p, {
      x: '100%',
      duration: DURATION,
      ease: EASE_IN,
      onComplete: () => {
        isClosingRef.current = false;
        closeEditDrawer();
      },
    });
  }, [closeEditDrawer]);

  if (!member) return null;

  const initialValues: MemberFormValues = {
    name: member.name || '',
    phoneNumber: member.phoneNumber || '',
    amount: member.amount || 0,
    currency: member.currency || Currency.NGN,
    dueDate: member.dueDate || '',
    paymentStatus: member.paymentStatus || PaymentStatus.PENDING,
    reminderFrequency: member.reminderFrequency || ReminderFrequency.MONTHLY,
  };

  const handleSubmit = async (values: MemberFormValues): Promise<void> => {
    if (!member.id) return;

    try {
      await updateMember(member.id, {
        name: values.name,
        phoneNumber: values.phoneNumber,
        amount: values.amount || 0,
        currency: values.currency,
        dueDate: values.dueDate,
        paymentStatus: values.paymentStatus,
        reminderFrequency: values.reminderFrequency,
      });
      handleClose();
    } catch {
      // Error already handled in hook
    }
  };

  const overlay = (
    <>
      {/* Backdrop - portaled to body so it covers full viewport including sidebar */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 pointer-events-auto"
        style={{ zIndex: 9998 }}
        onClick={handleClose}
        aria-hidden={!isEditDrawerOpen}
      />

      {/* Drawer */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
        style={{ zIndex: 9999 }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isEditDrawerOpen}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Edit Member</h2>
              <p className="text-sm text-slate-500 mt-1">Update member details below</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-700"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <Formik
              innerRef={formikRef}
              initialValues={initialValues}
              validationSchema={memberSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({
                values,
                handleChange,
                handleBlur,
                handleSubmit,
                errors,
                touched,
                isSubmitting,
                setFieldValue,
              }) => (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <Input
                    type="text"
                    name="name"
                    label={
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-cyan-600" />
                        <span>Full Name</span>
                      </div>
                    }
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur as (e?: React.FocusEvent<HTMLElement>) => void}
                    placeholder="John Doe"
                    error={touched.name ? errors.name : undefined}
                    touched={touched.name}
                  />

                  {/* Phone Number */}
                  <Input
                    type="tel"
                    name="phoneNumber"
                    label={
                      <div className="flex items-center space-x-2">
                        <Phone size={16} className="text-cyan-600" />
                        <span>Phone Number</span>
                      </div>
                    }
                    value={values.phoneNumber}
                    onChange={handleChange}
                    onBlur={handleBlur as (e?: React.FocusEvent<HTMLElement>) => void}
                    placeholder="+2348012345678"
                    error={touched.phoneNumber ? errors.phoneNumber : undefined}
                    touched={touched.phoneNumber}
                  />

                  {/* Amount */}
                  <NumberInput
                    name="amount"
                    label={
                      <div className="flex items-center space-x-2">
                        <DollarSign size={16} className="text-cyan-600" />
                        <span>Amount</span>
                      </div>
                    }
                    value={values.amount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="5000.00"
                    min={0}
                    allowDecimals={true}
                    error={touched.amount ? errors.amount : undefined}
                    touched={touched.amount}
                  />

                  {/* Currency */}
                  <CustomSelect
                    name="currency"
                    label={
                      <div className="flex items-center space-x-2">
                        <DollarSign size={16} className="text-cyan-600" />
                        <span>Currency</span>
                      </div>
                    }
                    value={values.currency}
                    onChange={(value) => {
                      setFieldValue('currency', value);
                    }}
                    onBlur={handleBlur as (e?: React.FocusEvent<HTMLElement>) => void}
                    error={touched.currency ? errors.currency : undefined}
                    touched={touched.currency}
                    options={[
                      { value: 'NGN', label: 'NGN - Nigerian Naira' },
                      { value: 'USD', label: 'USD - US Dollar' },
                      { value: 'GBP', label: 'GBP - British Pound' },
                      { value: 'EUR', label: 'EUR - Euro' },
                    ]}
                  />

                  {/* Due Date */}
                  <DatePicker
                    name="dueDate"
                    label={
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-cyan-600" />
                        <span>Due Date</span>
                      </div>
                    }
                    value={values.dueDate}
                    onChange={(value) => {
                      setFieldValue('dueDate', value);
                    }}
                    onBlur={handleBlur as (e?: React.FocusEvent<HTMLElement>) => void}
                    error={touched.dueDate ? errors.dueDate : undefined}
                    touched={touched.dueDate}
                    placeholder="Select due date"
                  />

                  {/* Payment Status */}
                  <CustomSelect
                    name="paymentStatus"
                    label={
                      <div className="flex items-center space-x-2">
                        <CreditCard size={16} className="text-cyan-600" />
                        <span>Payment Status</span>
                      </div>
                    }
                    value={values.paymentStatus}
                    onChange={(value) => {
                      setFieldValue('paymentStatus', value);
                    }}
                    onBlur={handleBlur as (e?: React.FocusEvent<HTMLElement>) => void}
                    error={touched.paymentStatus ? errors.paymentStatus : undefined}
                    touched={touched.paymentStatus}
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'processing', label: 'Processing' },
                      { value: 'paid', label: 'Paid' },
                      { value: 'failed', label: 'Failed' },
                    ]}
                  />

                  {/* Reminder Frequency */}
                  <CustomSelect
                    name="reminderFrequency"
                    label={
                      <div className="flex items-center space-x-2">
                        <Bell size={16} className="text-cyan-600" />
                        <span>Reminder Frequency</span>
                      </div>
                    }
                    value={values.reminderFrequency}
                    onChange={(value) => {
                      setFieldValue('reminderFrequency', value);
                    }}
                    onBlur={handleBlur as (e?: React.FocusEvent<HTMLElement>) => void}
                    error={touched.reminderFrequency ? errors.reminderFrequency : undefined}
                    touched={touched.reminderFrequency}
                    options={[
                      { value: 'daily', label: 'Daily' },
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'yearly', label: 'Yearly' },
                    ]}
                  />

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-200 flex space-x-3">
                    <button
                      type="button"
                      onClick={closeEditDrawer}
                      className="flex-1 px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || apiState.updateMember}
                      className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting || apiState.updateMember ? 'Updating...' : 'Update Member'}
                    </button>
                  </div>
                </form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  );
  return createPortal(overlay, document.body);
};
