import React, { useState, useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  X,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  Plus,
} from 'lucide-react';
import classNames from 'classnames';
import { ICreateMemberPayload, Currency, PaymentStatus, ReminderFrequency } from '@/types';
import { Input } from './Input';
import { NumberInput } from './NumberInput';
import { CustomSelect } from './CustomSelect';
import { DatePicker } from './DatePicker';

const CSV_HEADERS = 'name,phoneNumber,amount,currency,dueDate,paymentStatus,reminderFrequency';

const SAMPLE_CSV = `${CSV_HEADERS}
John Doe,+2348012345678,5000,NGN,2024-12-31,pending,monthly
Jane Smith,+2348098765432,3000,NGN,2024-12-25,pending,daily`;

interface ParsedRow {
  index: number;
  data: ICreateMemberPayload | null;
  error: string | null;
}

/** Editable row for bulk upload: form values (amount as string for input) */
export interface EditableMemberRow {
  id: string;
  name: string;
  phoneNumber: string;
  amount: string;
  currency: Currency;
  dueDate: string;
  paymentStatus: PaymentStatus;
  reminderFrequency: ReminderFrequency;
  parseError?: string;
}

interface BulkUploadMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (payloads: ICreateMemberPayload[]) => Promise<void>;
  isUploading: boolean;
}

function parseCSV(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  return lines.map((line) => line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')));
}

function parseRow(row: string[], index: number): ParsedRow {
  const [name, phoneNumber, amountStr, currency, dueDate, paymentStatus, reminderFrequency] = row;
  const errors: string[] = [];

  if (!name?.trim()) errors.push('Name is required');
  if (!phoneNumber?.trim()) errors.push('Phone number is required');
  const amount = amountStr ? Number(amountStr) : NaN;
  if (Number.isNaN(amount) || amount < 0) errors.push('Valid amount is required');
  const currencyVal = (currency?.toUpperCase() || 'NGN') as Currency;
  if (currencyVal !== Currency.NGN) errors.push('Currency must be NGN');
  if (!dueDate?.trim()) errors.push('Due date is required');
  const ps = (paymentStatus?.toLowerCase() || 'pending') as PaymentStatus;
  if (!['pending', 'paid', 'failed'].includes(ps)) errors.push('Invalid payment status');
  const rf = (reminderFrequency?.toLowerCase() || 'monthly') as ReminderFrequency;
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(rf))
    errors.push('Invalid reminder frequency');

  if (errors.length > 0) {
    return { index, data: null, error: errors.join('; ') };
  }

  const payload: ICreateMemberPayload = {
    name: name.trim(),
    phoneNumber: phoneNumber.trim().replace(/^0/, '+234'),
    amount: Number(amount),
    currency: currencyVal,
    dueDate: dueDate.trim(),
    paymentStatus: ps,
    reminderFrequency: rf,
  };
  return { index, data: payload, error: null };
}

function createEmptyRow(): EditableMemberRow {
  return {
    id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: '',
    phoneNumber: '',
    amount: '',
    currency: Currency.NGN,
    dueDate: '',
    paymentStatus: PaymentStatus.PENDING,
    reminderFrequency: ReminderFrequency.MONTHLY,
  };
}

function parsedToEditable(parsed: ParsedRow[]): EditableMemberRow[] {
  return parsed.map((row, i) => {
    const id = `row-${Date.now()}-${i}`;
    if (row.data) {
      return {
        id,
        name: row.data.name,
        phoneNumber: row.data.phoneNumber,
        amount: String(row.data.amount),
        currency: row.data.currency,
        dueDate: row.data.dueDate,
        paymentStatus: row.data.paymentStatus,
        reminderFrequency: row.data.reminderFrequency,
      };
    }
    return {
      id,
      name: '',
      phoneNumber: '',
      amount: '',
      currency: Currency.NGN,
      dueDate: '',
      paymentStatus: PaymentStatus.PENDING,
      reminderFrequency: ReminderFrequency.MONTHLY,
      parseError: row.error ?? undefined,
    };
  });
}

function validateRow(row: EditableMemberRow): string | null {
  const err: string[] = [];
  if (!row.name?.trim()) err.push('Name is required');
  if (!row.phoneNumber?.trim()) err.push('Phone number is required');
  const amount = Number(row.amount);
  if (Number.isNaN(amount) || amount < 0) err.push('Valid amount is required');
  if (row.currency !== Currency.NGN) err.push('Currency must be NGN');
  if (!row.dueDate?.trim()) err.push('Due date is required');
  if (!['pending', 'paid', 'failed'].includes(row.paymentStatus))
    err.push('Invalid payment status');
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(row.reminderFrequency))
    err.push('Invalid reminder frequency');
  return err.length > 0 ? err.join('; ') : null;
}

function rowToPayload(row: EditableMemberRow): ICreateMemberPayload | null {
  const err = validateRow(row);
  if (err) return null;
  const amount = Number(row.amount);
  return {
    name: row.name.trim(),
    phoneNumber: row.phoneNumber.trim().replace(/^0/, '+234'),
    amount,
    currency: row.currency,
    dueDate: row.dueDate.trim(),
    paymentStatus: row.paymentStatus,
    reminderFrequency: row.reminderFrequency,
  };
}

export const BulkUploadMembersModal: React.FC<BulkUploadMembersModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isUploading,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [editableRows, setEditableRows] = useState<EditableMemberRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  const DURATION = 0.25;
  const EASE_OUT = 'power2.out';
  const EASE_IN = 'power2.in';

  useEffect(() => {
    if (!isOpen) return;
    const o = overlayRef.current;
    const p = panelRef.current;
    if (!o || !p) return;
    gsap.fromTo(o, { opacity: 0 }, { opacity: 1, duration: DURATION, ease: EASE_OUT });
    gsap.fromTo(
      p,
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: DURATION, ease: EASE_OUT }
    );
  }, [isOpen]);

  const handleDownloadSample = useCallback(() => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'members-upload-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith('.csv')) {
      return;
    }
    setFile(selectedFile);
    setFileName(selectedFile.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const rows = parseCSV(text);
      if (rows.length < 2) {
        setEditableRows([]);
        return;
      }
      const dataRows = rows.slice(1);
      const parsed = dataRows.map((row, i) => parseRow(row, i + 2));
      setEditableRows(parsedToEditable(parsed));
    };
    reader.readAsText(selectedFile);
    e.target.value = '';
  }, []);

  const updateRow = useCallback(
    (
      rowId: string,
      field: keyof EditableMemberRow,
      value: string | Currency | PaymentStatus | ReminderFrequency
    ) => {
      setEditableRows((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, [field]: value, parseError: undefined } : r))
      );
    },
    []
  );

  const removeRow = useCallback((rowId: string) => {
    setEditableRows((prev) => prev.filter((r) => r.id !== rowId));
  }, []);

  const addRow = useCallback(() => {
    setEditableRows((prev) => [...prev, createEmptyRow()]);
  }, []);

  const validPayloads = editableRows
    .map((r) => rowToPayload(r))
    .filter((p): p is ICreateMemberPayload => p !== null);
  const validCount = validPayloads.length;
  const errorCount = editableRows.filter((r) => validateRow(r) !== null).length;

  const handleUpload = useCallback(async () => {
    const payloads = editableRows
      .map((r) => rowToPayload(r))
      .filter((p): p is ICreateMemberPayload => p !== null);
    if (payloads.length === 0) return;
    await onUpload(payloads);
    setFile(null);
    setEditableRows([]);
    setFileName('');
    onClose();
  }, [editableRows, onUpload, onClose]);

  const handleClose = useCallback(() => {
    if (isUploading) return;
    if (isClosingRef.current) return;
    const o = overlayRef.current;
    const p = panelRef.current;
    if (!o || !p) {
      setFile(null);
      setEditableRows([]);
      setFileName('');
      onClose();
      return;
    }
    isClosingRef.current = true;
    gsap.to(o, { opacity: 0, duration: DURATION, ease: EASE_IN });
    gsap.to(p, {
      scale: 0.95,
      opacity: 0,
      duration: DURATION,
      ease: EASE_IN,
      onComplete: () => {
        isClosingRef.current = false;
        setFile(null);
        setEditableRows([]);
        setFileName('');
        onClose();
      },
    });
  }, [onClose, isUploading]);

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-50 pointer-events-auto"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={panelRef}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-cyan-50">
                <FileSpreadsheet className="text-cyan-600" size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Bulk Upload Members</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Upload a CSV file to add multiple members at once
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleDownloadSample();
                }}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-medium text-sm"
              >
                <Download size={16} />
                <span>Download template</span>
              </a>
              <label className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 font-medium text-sm cursor-pointer">
                <Upload size={16} />
                <span>Choose CSV file</span>
                <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            {fileName && (
              <p className="text-sm text-slate-600">
                Selected: <span className="font-medium">{fileName}</span>
              </p>
            )}

            {editableRows.length > 0 && (
              <>
                <div className="flex items-center gap-4 flex-wrap justify-between">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="inline-flex items-center space-x-1.5 text-sm text-emerald-600">
                      <CheckCircle2 size={16} />
                      <span>{validCount} valid row(s)</span>
                    </span>
                    {errorCount > 0 && (
                      <span className="inline-flex items-center space-x-1.5 text-sm text-amber-600">
                        <AlertCircle size={16} />
                        <span>{errorCount} row(s) with errors</span>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-medium text-sm"
                  >
                    <Plus size={16} />
                    <span>Add row</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {editableRows.map((row, idx) => {
                    const rowError = validateRow(row);
                    const isValid = !rowError;
                    return (
                      <div
                        key={row.id}
                        className={classNames(
                          'border rounded-xl p-4 space-y-3',
                          isValid
                            ? 'border-slate-200 bg-slate-50/30'
                            : 'border-amber-200 bg-amber-50/30'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-slate-600">
                            Member {idx + 1}
                          </span>
                          {row.parseError && (
                            <span
                              className="text-xs text-amber-600 flex-1 truncate"
                              title={row.parseError}
                            >
                              Parse: {row.parseError}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors"
                            title="Remove row"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            label="Name"
                            value={row.name}
                            onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                            placeholder="John Doe"
                            size="sm"
                          />
                          <Input
                            type="tel"
                            label="Phone"
                            value={row.phoneNumber}
                            onChange={(e) => updateRow(row.id, 'phoneNumber', e.target.value)}
                            placeholder="+2348012345678"
                            size="sm"
                          />
                          <NumberInput
                            name={`amount-${row.id}`}
                            label="Amount"
                            value={row.amount}
                            onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
                            placeholder="5000"
                            min={0}
                            allowDecimals={true}
                            size="sm"
                          />
                          <CustomSelect
                            name={`currency-${row.id}`}
                            label="Currency"
                            value={row.currency}
                            onChange={(v) => updateRow(row.id, 'currency', v as Currency)}
                            options={[{ value: 'NGN', label: 'NGN' }]}
                            size="sm"
                          />
                          <DatePicker
                            name={`dueDate-${row.id}`}
                            label="Due Date"
                            value={row.dueDate}
                            onChange={(v) => updateRow(row.id, 'dueDate', v)}
                            placeholder="Select date"
                            size="sm"
                          />
                          <CustomSelect
                            name={`paymentStatus-${row.id}`}
                            label="Status"
                            value={row.paymentStatus}
                            onChange={(v) => updateRow(row.id, 'paymentStatus', v as PaymentStatus)}
                            options={[
                              { value: 'pending', label: 'Pending' },
                              { value: 'paid', label: 'Paid' },
                              { value: 'failed', label: 'Failed' },
                            ]}
                            size="sm"
                          />
                          <CustomSelect
                            name={`reminderFrequency-${row.id}`}
                            label="Reminder"
                            value={row.reminderFrequency}
                            onChange={(v) =>
                              updateRow(row.id, 'reminderFrequency', v as ReminderFrequency)
                            }
                            options={[
                              { value: 'daily', label: 'Daily' },
                              { value: 'weekly', label: 'Weekly' },
                              { value: 'monthly', label: 'Monthly' },
                              { value: 'yearly', label: 'Yearly' },
                            ]}
                            size="sm"
                          />
                        </div>
                        {rowError && <p className="text-xs text-amber-600">{rowError}</p>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {editableRows.length === 0 && file === null && (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                <Upload className="mx-auto text-slate-300 mb-4" size={16} />
                <p className="text-slate-500 font-medium">No file selected</p>
                <p className="text-sm text-slate-400 mt-1">
                  Download the template, fill in your members, then upload the CSV here — or add
                  members manually below.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Columns: name, phoneNumber, amount, currency, dueDate, paymentStatus,
                  reminderFrequency
                </p>
                <button
                  type="button"
                  onClick={addRow}
                  className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 font-medium text-sm"
                >
                  <Plus size={16} />
                  <span>Add member manually</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50/50">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || validCount === 0}
              className="inline-flex items-center space-x-2 px-6 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Upload {validCount} member(s)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
