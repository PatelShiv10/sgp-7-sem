
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreditCard, 
  Banknote, 
  TrendingUp, 
  Calendar,
  DollarSign,
  User,
  FileText,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import axios from 'axios';

interface PaymentDetails {
  _id: string;
  lawyerId: string;
  bankName: string;
  accountNumber: string;
  IFSC: string;
  upiId?: string;
  accountHolderName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  _id: string;
  transactionId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lawyerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: 'upi' | 'bank_transfer' | 'card' | 'wallet';
  description: string;
  appointmentId?: string;
  notes?: string;
  createdAt: string;
}

interface TransactionStats {
  monthly: {
    count: number;
    totalAmount: number;
  };
  total: {
    count: number;
    totalAmount: number;
  };
  statusBreakdown: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
}

const LawyerPayments: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for payment details
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    IFSC: '',
    upiId: '',
    accountHolderName: ''
  });

  useEffect(() => {
    if (user?.id) {
      loadPaymentDetails();
      loadTransactions();
      loadStats();
    }
  }, [user?.id]);

  const loadPaymentDetails = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/payments/details/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaymentDetails(response.data.data);
      setFormData({
        bankName: response.data.data.bankName,
        accountNumber: response.data.data.accountNumber,
        IFSC: response.data.data.IFSC,
        upiId: response.data.data.upiId || '',
        accountHolderName: response.data.data.accountHolderName
      });
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast({
          title: "Error",
          description: "Failed to load payment details",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/payments/transactions/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.data.transactions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/payments/stats/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSavePaymentDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/payments/details', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPaymentDetails(response.data.data);
      toast({
        title: "Success",
        description: "Payment details saved successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save payment details",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'upi': return <Banknote className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer': return <Banknote className="h-4 w-4" />;
      case 'wallet': return <DollarSign className="h-4 w-4" />;
      default: return <Banknote className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments & Transactions</h1>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Payment Details</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Payment Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Bank Account Details
              </CardTitle>
              <CardDescription>
                Add or update your bank account details to receive payments from clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePaymentDetails} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      placeholder="e.g., State Bank of India"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                    <Input
                      id="accountHolderName"
                      name="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={handleInputChange}
                      placeholder="e.g., Adv. John Smith"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., 1234567890"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="IFSC">IFSC Code *</Label>
                    <Input
                      id="IFSC"
                      name="IFSC"
                      value={formData.IFSC}
                      onChange={handleInputChange}
                      placeholder="e.g., SBIN0001234"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="upiId">UPI ID (Optional)</Label>
                    <Input
                      id="upiId"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      placeholder="e.g., lawyer@bank"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isSaving} className="w-full">
                  {isSaving ? 'Saving...' : 'Save Payment Details'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Payment History
              </CardTitle>
              <CardDescription>
                View all transactions and payments received from clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                  <p className="text-gray-500">Transactions from your clients will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Transaction ID</th>
                        <th className="text-left py-3 px-4">Client</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Method</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-sm">
                            {transaction.transactionId}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">
                                {transaction.userId.firstName} {transaction.userId.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{transaction.userId.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {formatAmount(transaction.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(transaction.paymentMethod)}
                              <span className="capitalize">{transaction.paymentMethod.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {transaction.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatAmount(stats.monthly.totalAmount)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.monthly.count} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatAmount(stats.total.totalAmount)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.total.count} total transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.statusBreakdown.find(s => s._id === 'completed')?.count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    completed transactions
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Transaction Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.statusBreakdown.map((status) => (
                    <div key={status._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(status._id)}>
                          {status._id}
                        </Badge>
                        <span className="text-sm">{status.count} transactions</span>
                      </div>
                      <span className="font-semibold">{formatAmount(status.totalAmount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LawyerPayments;
