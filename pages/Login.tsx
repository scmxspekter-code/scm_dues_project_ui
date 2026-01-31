import React from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Formik } from 'formik';
import { authSchema } from '@/schemas/auth.schema';
import classNames from 'classnames';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '../components/Input';

export const Login: React.FC = () => {
  const { handleSubmit, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))]  from-cyan-100 via-slate-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-600 rounded-2xl shadow-xl shadow-cyan-200 mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">Sperktar Admin</h1>
          <p className="text-slate-500 mt-2 font-medium">SCM Nigeria Dues Management Portal</p>
        </div>

        <div className="bg-white p-8 rounded-4xl shadow-2xl shadow-slate-200/60 border border-slate-100">
          <Formik
            initialValues={{ email: '', password: '' }}
            onSubmit={handleSubmit}
            validationSchema={authSchema}
          >
            {({
              values,
              handleChange,
              handleSubmit,
              handleBlur,
              errors,
              touched,
              isValid,
              status,
            }) => (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-sm text-red-600 font-medium">{status}</p>
                  </div>
                )}

                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  labelClassName="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1"
                  leftIcon={<Mail size={16} />}
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="admin@scm.ng"
                  error={touched.email ? errors.email : undefined}
                  touched={touched.email}
                  size="lg"
                  className="rounded-2xl focus:ring-4 focus:ring-cyan-500/10"
                />

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Password
                    </label>
                    <a href="#" className="text-xs font-bold text-cyan-600 hover:text-cyan-700">
                      Forgot?
                    </a>
                  </div>
                  <Input
                    type="password"
                    name="password"
                    leftIcon={<Lock size={16} />}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    error={touched.password ? errors.password : undefined}
                    touched={touched.password}
                    size="lg"
                    className="rounded-2xl focus:ring-4 focus:ring-cyan-500/10"
                    containerClassName="space-y-0"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className={classNames(
                    'w-full py-4 bg-cyan-600 disabled:bg-cyan-400  text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-cyan-700 ] transition-all shadow-lg shadow-cyan-200 disabled:opacity-70',
                    { 'cursor-not-allowed scale-95': !isValid || isLoading },
                    { 'active:scale-[0.98]': isValid || isLoading }
                  )}
                >
                  <span>{isLoading ? 'Verifying...' : 'Sign In to Dashboard'}</span>
                  {!isLoading && <ArrowRight size={16} />}
                </button>
              </form>
            )}
          </Formik>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400 font-medium">
              Need access?{' '}
              <a href="#" className="text-cyan-600 font-bold hover:underline">
                Contact SCM Support
              </a>
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-slate-400 font-medium">
          &copy; 2025 Sperktar Automated Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
};
