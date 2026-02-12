import React, { useEffect } from 'react';
import { User, Mail, Lock, KeyRound } from 'lucide-react';
import { Formik } from 'formik';
import classNames from 'classnames';
import { useAppSelector } from '@/store/hooks';
import { useAuth } from '@/hooks/useAuth';
import { changePasswordSchema } from '@/schemas/auth.schema';
import { Input } from '@/components/Input';

export const Account: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const { me, updatePassword, isLoading } = useAuth();

  useEffect(() => {
    me().catch(() => {
      // Error already handled in hook
    });
  }, [me]);

  return (
    <div className="space-y-8">
      {/* Profile section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center space-x-2">
          <User size={16} className="text-cyan-600" />
          <span>Profile</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              First name
            </label>
            <p className="text-sm font-medium text-slate-800">{user?.firstname ?? '—'}</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Last name
            </label>
            <p className="text-sm font-medium text-slate-800">{user?.lastname ?? '—'}</p>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <Mail size={14} />
              <span>Email</span>
            </label>
            <p className="text-sm font-medium text-slate-800">{user?.email ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Change password section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center space-x-2">
          <KeyRound size={16} className="text-cyan-600" />
          <span>Change password</span>
        </h3>
        <Formik
          initialValues={{
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={changePasswordSchema}
          onSubmit={async (values) => {
            await updatePassword({
              oldPassword: values.oldPassword,
              newPassword: values.newPassword,
            });
          }}
        >
          {({
            values,
            handleChange,
            handleBlur,
            handleSubmit,
            errors,
            touched,
            isValid,
          }) => (
            <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
              <Input
                type="password"
                name="oldPassword"
                label="Current password"
                labelClassName="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1"
                leftIcon={<Lock size={16} />}
                value={values.oldPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                error={touched.oldPassword ? errors.oldPassword : undefined}
                touched={touched.oldPassword}
                size="lg"
                className="rounded-2xl focus:ring-4 focus:ring-cyan-500/10"
              />
              <Input
                type="password"
                name="newPassword"
                label="New password"
                labelClassName="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1"
                leftIcon={<Lock size={16} />}
                value={values.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                error={touched.newPassword ? errors.newPassword : undefined}
                touched={touched.newPassword}
                size="lg"
                className="rounded-2xl focus:ring-4 focus:ring-cyan-500/10"
              />
              <Input
                type="password"
                name="confirmPassword"
                label="Confirm new password"
                labelClassName="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1"
                leftIcon={<Lock size={16} />}
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                error={touched.confirmPassword ? errors.confirmPassword : undefined}
                touched={touched.confirmPassword}
                size="lg"
                className="rounded-2xl focus:ring-4 focus:ring-cyan-500/10"
              />
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className={classNames(
                  'w-full py-4 bg-cyan-600 disabled:bg-cyan-400 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200 disabled:opacity-70',
                  { 'cursor-not-allowed scale-95': !isValid || isLoading },
                  { 'active:scale-[0.98]': isValid && !isLoading }
                )}
              >
                <span>{isLoading ? 'Updating...' : 'Update password'}</span>
              </button>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
};
