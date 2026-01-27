import React, { useEffect } from 'react';
import { X, User, Phone, DollarSign, Calendar, CreditCard, Bell } from 'lucide-react';
import { Formik } from 'formik';
import classNames from 'classnames';
import { useMembers } from '@/hooks/useMembers';
import { Input } from './Input';
import { CustomSelect } from './CustomSelect';
import { DatePicker } from './DatePicker';
import { NumberInput } from './NumberInput';
import { memberSchema } from '@/schemas/member.schema';




export const AddMemberDrawer: React.FC = () => {
  const { createMember, isAddMemberDrawerOpen, closeAddMemberDrawer } = useMembers();
  const isOpen = isAddMemberDrawerOpen;
  
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

  

  const initialValues = {
   name: '',
      phoneNumber: '',
      amount: 0,
      currency: "NGN",
      dueDate: "2024-12-31T00:00:00.000Z",
      paymentStatus: "pending",
      reminderFrequency: "monthly"
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 top-0 bg-black/50 z-40 transition-opacity"
          onClick={closeAddMemberDrawer}
        />
      )}

      {/* Drawer */}
      <div
        className={classNames(
          'fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto',
          {
            'translate-x-0': isOpen,
            'translate-x-full': !isOpen,
          }
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Add New Member</h2>
              <p className="text-sm text-slate-500 mt-1">Fill in the member details below</p>
            </div>
            <button
              onClick={closeAddMemberDrawer}
              className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 p-6">
            <Formik
              initialValues={initialValues}
              validationSchema={memberSchema}
              onSubmit={createMember}
            >
              {({ values, handleChange, handleBlur, handleSubmit, errors, touched, isSubmitting }) => (
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
                    onBlur={handleBlur}
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
                      handleChange({ target: { name: 'currency', value } } as any);
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
                      handleChange({ target: { name: 'dueDate', value } } as any);
                    }}
                    onBlur={handleBlur}
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
                      handleChange({ target: { name: 'paymentStatus', value } } as any);
                    }}
                    onBlur={handleBlur}
                    error={touched.paymentStatus ? errors.paymentStatus : undefined}
                    touched={touched.paymentStatus}
                    options={[
                      { value: "pending", label: "Pending" },
                      { value: "processing", label: "Processing" },
                      { value: "paid", label: "Paid" },
                      { value: "failed", label: "Failed" },
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
                      handleChange({ target: { name: 'reminderFrequency', value } } as any);
                    }}
                    onBlur={handleBlur}
                    error={touched.reminderFrequency ? errors.reminderFrequency : undefined}
                    touched={touched.reminderFrequency}
                    options={[
                      { value: "daily", label: "Daily" },
                      { value: "monthly", label: "Monthly" },
                      { value: "yearly", label: "Yearly" },
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
};
