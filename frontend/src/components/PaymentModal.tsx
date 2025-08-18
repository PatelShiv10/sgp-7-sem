import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, Banknote, DollarSign, Wallet, Loader2, Star } from 'lucide-react';
import axios from 'axios';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyerId: string;
  lawyerName: string;
  amount?: number;
  appointmentId?: string;
  onSuccess?: () => void;
  showReviewButton?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  lawyerId,
  lawyerName,
  amount = 1000,
  appointmentId,
  onSuccess,
  showReviewButton = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: amount,
    paymentMethod: 'upi',
    description: `Payment for consultation with ${lawyerName}`,
    notes: ''
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (value: string) => {
    setPaymentData({
      ...paymentData,
      paymentMethod: value
    });
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to make a payment",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/payments/transaction', {
        lawyerId,
        amount: parseFloat(paymentData.amount.toString()),
        paymentMethod: paymentData.paymentMethod,
        description: paymentData.description,
        appointmentId,
        notes: paymentData.notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Payment Successful!",
        description: `Payment of ₹${paymentData.amount} has been processed successfully.`,
      });

      setPaymentSuccess(true);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.response?.data?.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'upi': return <Banknote className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer': return <Banknote className="h-4 w-4" />;
      case 'wallet': return <Wallet className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleWriteReview = () => {
    window.location.href = `/review/${lawyerId}`;
  };

  const handleClose = () => {
    setPaymentSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {paymentSuccess ? (
              <>
                <DollarSign className="h-5 w-5 text-green-600" />
                Payment Successful!
              </>
            ) : (
              <>
                <DollarSign className="h-5 w-5" />
                Pay Lawyer
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {paymentSuccess 
              ? `Payment of ${formatAmount(paymentData.amount)} has been processed successfully.`
              : `Complete your payment to ${lawyerName}`
            }
          </DialogDescription>
        </DialogHeader>

        {paymentSuccess ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Payment Completed Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                Your payment of {formatAmount(paymentData.amount)} has been processed.
              </p>
            </div>

            {showReviewButton && (
              <div className="space-y-3">
                <Button
                  onClick={handleWriteReview}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Share your experience with {lawyerName}
                </p>
              </div>
            )}

            <Button
              onClick={handleClose}
              className="w-full"
              variant="outline"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Amount */}
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={paymentData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                min="1"
                required
              />
            </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={paymentData.paymentMethod} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upi">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    UPI
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Credit/Debit Card
                  </div>
                </SelectItem>
                <SelectItem value="bank_transfer">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Bank Transfer
                  </div>
                </SelectItem>
                <SelectItem value="wallet">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Digital Wallet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={paymentData.description}
              onChange={handleInputChange}
              placeholder="Payment description"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={paymentData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Payment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Lawyer:</span>
                <span className="font-medium">{lawyerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">{formatAmount(paymentData.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-medium capitalize flex items-center gap-1">
                  {getPaymentMethodIcon(paymentData.paymentMethod)}
                  {paymentData.paymentMethod.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isProcessing || paymentData.amount <= 0}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pay {formatAmount(paymentData.amount)}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
