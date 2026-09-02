'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  Receipt
} from 'lucide-react';

interface ThermalReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ThermalReceiptModal({ order, isOpen, onClose }: ThermalReceiptModalProps) {
  const { currentUser } = useAuth();

  if (!isOpen || !order) return null;

  // Authorization Check: Customer who placed order, or staff (ADMIN, RESTAURANT_MANAGER, DELIVERY_PERSON)
  const isAuthorized =
    currentUser &&
    (currentUser.role === 'ADMIN' ||
      currentUser.role === 'RESTAURANT_MANAGER' ||
      currentUser.role === 'DELIVERY_PERSON' ||
      order.customerId === currentUser.id);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">

      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Container */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[90vh]">

        {/* Modal Top Header (Screen Only) */}
        <div className="bg-slate-950 text-white p-4 sm:p-5 flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center ring-1 ring-brand-500/40">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-outfit">Thermal Receipt</h3>
              <p className="text-[11px] text-slate-400">Order #{order.orderNumber} • Official Memo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body & Thermal Paper Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/80 flex flex-col items-center">

          {!isAuthorized ? (
            <div className="bg-white p-8 rounded-3xl text-center space-y-4 max-w-sm my-auto">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">Access Restricted</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                You do not have permission to view or print the thermal receipt memo for this order.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          ) : (
            <>



              {/* Printable 80mm Receipt Container */}
              <div
                id="thermal-receipt-print"
                className="thermal-receipt-print-area w-full max-w-[320px] bg-white text-slate-900 font-mono text-[11px] leading-tight p-4 shadow-xl border border-slate-200/80 rounded-sm relative select-text"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                {/* Receipt Header */}
                <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
                  <h2 className="text-base font-black tracking-tighter uppercase font-sans">QUICKBITE</h2>
                  <p className="font-bold text-xs uppercase">{order.restaurantName}</p>
                  <p className="text-[10px] text-slate-600">{order.restaurantAddress || 'Dhaka, Bangladesh'}</p>
                  <p className="text-[10px] text-slate-600">Tel: +880 1700-000000</p>
                </div>

                {/* Receipt Subheader Info */}
                <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>ORDER #: {order.orderNumber}</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div className="text-[10px] text-slate-600">
                    DATE: {formatDate(order.createdAt)}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    TRX: {order.transactionId || `TRX_${order.id}`}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5">
                  <p className="font-bold">CUSTOMER INFO:</p>
                  <p className="truncate">NAME: {order.customerName}</p>
                  <p>TEL : {order.customerPhone}</p>
                  <p className="break-words text-[10px]">ADDR: {order.deliveryAddress}</p>
                  {order.notes && (
                    <p className="text-[10px] italic">NOTE: {order.notes}</p>
                  )}
                </div>

                {/* Items Table */}
                <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
                  <div className="flex justify-between font-bold border-b border-slate-300 pb-1">
                    <span className="w-8">QTY</span>
                    <span className="flex-1 text-left px-1">ITEM</span>
                    <span className="w-16 text-right">TOTAL</span>
                  </div>

                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-start text-[10.5px]">
                      <span className="w-8 font-bold">{it.quantity}x</span>
                      <span className="flex-1 text-left px-1 break-words">{it.name}</span>
                      <span className="w-16 text-right font-bold">{formatPrice(it.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Financial Totals */}
                <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>SUBTOTAL</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DELIVERY FEE</span>
                    <span>{formatPrice(order.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TAX / VAT (5%)</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between font-bold">
                      <span>DISCOUNT</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-400 mt-1">
                    <span>TOTAL PAID</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Payment Badge */}
                <div className="py-2 text-center border-b border-dashed border-slate-400">
                  <p className="font-bold text-xs uppercase">
                    PAYMENT: {order.paymentMethod} ({order.paymentStatus})
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">STATUS: {order.status.replace(/_/g, ' ')}</p>
                </div>

                {/* Barcode & Footer */}
                <div className="pt-3 text-center space-y-2">
                  <div className="flex flex-col items-center justify-center opacity-80">
                    {/* Simulated POS Barcode */}
                    <div className="h-8 w-44 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_7px,transparent_7px,transparent_9px)] my-1" />
                    <span className="text-[9px] tracking-widest font-mono">{order.id}</span>
                  </div>

                  <p className="font-bold text-[10px] uppercase">*** THANK YOU FOR YOUR ORDER ***</p>
                  <p className="text-[9px] text-slate-500">Keep this receipt memo for reference</p>
                  <p className="text-[8px] text-slate-400 uppercase">QuickBite POS System v1.0</p>
                </div>

              </div>
            </>
          )}

        </div>

        {/* Modal Footer Actions (Screen Only) */}
        {isAuthorized && (
          <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 no-print">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Close
            </button>

            <button
              onClick={handlePrint}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              <span>Print 80mm Receipt</span>
            </button>
          </div>
        )}

      </div>

      {/* Global CSS for 80mm POS Thermal Printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          .thermal-receipt-print-area,
          .thermal-receipt-print-area * {
            visibility: visible !important;
          }
          .thermal-receipt-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            padding: 4mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: white !important;
            color: black !important;
          }
          @page {
            size: 80mm auto;
            margin: 0mm;
          }
        }
      `}</style>
    </div>
  );
}
