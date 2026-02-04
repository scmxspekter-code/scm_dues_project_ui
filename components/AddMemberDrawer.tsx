import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { X, User, Phone, DollarSign, Calendar, CreditCard, Bell } from 'lucide-react';
import { Formik } from 'formik';
import { useMembers } from '@/hooks/useMembers';
import { Input } from './Input';
import { PhoneNumberInput } from './PhoneNumberInput';
import { CustomSelect } from './CustomSelect';
import { DatePicker } from './DatePicker';
import { NumberInput } from './NumberInput';
import { memberSchema } from '@/schemas/member.schema';
import { Currency, PaymentStatus, ReminderFrequency } from '@/types';

const DURATION = 0.25;
const EASE_OUT = 'power2.out';
const EASE_IN = 'power2.in';

export const AddMemberDrawer: React.FC = () => {
  const { createMember, isAddMemberDrawerOpen, closeAddMemberDrawer } = useMembers();
  const isOpen = isAddMemberDrawerOpen;
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Enter animation
  useEffect(() => {
    if (!isOpen) return;
    const o = overlayRef.current;
    const p = panelRef.current;
    if (!o || !p) return;
    gsap.fromTo(o, { opacity: 0 }, { opacity: 1, duration: DURATION, ease: EASE_OUT });
    gsap.fromTo(p, { x: '100%' }, { x: 0, duration: DURATION, ease: EASE_OUT });
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    const o = overlayRef.current;
    const p = panelRef.current;
    if (!o || !p) {
      closeAddMemberDrawer();
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
        closeAddMemberDrawer();
      },
    });
  }, [closeAddMemberDrawer]);

  const initialValues = {
    name: '',
    phoneNumber: '',
    amount: 0,
    currency: Currency.NGN,
    dueDate: '',
    dob: '' as string,
    anniversary: '' as string,
    paymentStatus: PaymentStatus.PENDING,
    reminderFrequency: ReminderFrequency.MONTHLY,
  };

  if (!isOpen) return null;

  const overlay = (
    <>
      {/* Backdrop - covers full viewport when portaled to body */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 pointer-events-auto"
        style={{ zIndex: 9998 }}
        onClick={handleClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
        style={{ zIndex: 9999 }}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Add New Member</h2>
              <p className="text-sm text-slate-500 mt-1">Fill in the member details below</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 p-6">
            <Formik
              initialValues={initialValues}
              validationSchema={memberSchema}
              onSubmit={createMember}
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
                    onBlur={handleBlur}
                    placeholder="John Doe"
                    error={touched.name ? errors.name : undefined}
                    touched={touched.name}
                  />

                  {/* Phone Number */}
                  <PhoneNumberInput
                    name="phoneNumber"
                    label={
                      <div className="flex items-center space-x-2">
                        <Phone size={16} className="text-cyan-600" />
                        <span>Phone Number</span>
                      </div>
                    }
                    value={values.phoneNumber}
                    onChange={(value) => setFieldValue('phoneNumber', value)}
                    onBlur={handleBlur as (e?: React.FocusEvent<HTMLElement>) => void}
                    placeholder="8012345678"
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
                    onBlur={handleBlur}
                    error={touched.currency ? errors.currency : undefined}
                    touched={touched.currency}
                    options={[
                      { value: 'NGN', label: 'NGN - Nigerian Naira' },
                      { value: 'USD', label: 'USD - US Dollar' },
                      { value: 'GBP', label: 'GBP - British Pound' },
                      { value: 'EUR', label: 'EUR - Euro' },
                    ]}
                  />
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
                    onBlur={handleBlur}
                    error={touched.dueDate ? errors.dueDate : undefined}
                    touched={touched.dueDate}
                    placeholder="Select due date"
                  />

                  <DatePicker
                    name="dob"
                    label={
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-cyan-600" />
                        <span>Date of Birth</span>
                      </div>
                    }
                    value={values.dob}
                    onChange={(value) => {
                      setFieldValue('dob', value ?? '');
                    }}
                    onBlur={handleBlur}
                    error={touched.dob ? errors.dob : undefined}
                    touched={touched.dob}
                    placeholder="Select date of birth (optional)"
                  />

                  <DatePicker
                    name="anniversary"
                    label={
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-cyan-600" />
                        <span>Anniversary</span>
                      </div>
                    }
                    value={values.anniversary}
                    onChange={(value) => {
                      setFieldValue('anniversary', value ?? '');
                    }}
                    onBlur={handleBlur}
                    error={touched.anniversary ? errors.anniversary : undefined}
                    touched={touched.anniversary}
                    placeholder="Select anniversary date (optional)"
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
                    onBlur={handleBlur}
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
                    onBlur={handleBlur}
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
                      onClick={closeAddMemberDrawer}
                      className="flex-1 px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Adding...' : 'Add Member'}
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
