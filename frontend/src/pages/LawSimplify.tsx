
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LawSimplify = () => {
  const [legalText, setLegalText] = useState('');
  const [result, setResult] = useState<{
    explanation: string;
    example: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimplify = async () => {
    if (!legalText.trim()) return;

    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setResult({
        explanation: `This legal text essentially means: The provided clause establishes the terms and conditions for a specific legal agreement. In simpler terms, it outlines the rights, responsibilities, and obligations of all parties involved. The key points include definitions of important terms, the scope of the agreement, and the consequences of not following the stated conditions.`,
        example: `Real-life example: Think of this like a rental agreement for an apartment. Just as a lease specifies when rent is due, who's responsible for repairs, and what happens if rules are broken, this legal clause sets similar ground rules for whatever situation it governs. For instance, if this were about a service contract, it would be like saying "We'll provide the service, you'll pay on time, and here's what happens if either of us doesn't hold up our end of the deal."`
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy mb-4">LawSimplify</h1>
          <p className="text-xl text-gray-600">
            Transform complex legal jargon into plain English
          </p>
        </div>

        {/* Input Section */}
        <Card className="shadow-soft border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-navy">Enter Legal Text or Clause</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={legalText}
              onChange={(e) => setLegalText(e.target.value)}
              placeholder="Paste any legal clause, contract terms, or legal document text here..."
              className="min-h-[200px] border-gray-300 focus:border-teal focus:ring-teal"
            />
            <Button
              onClick={handleSimplify}
              disabled={!legalText.trim() || isLoading}
              className="bg-teal hover:bg-teal-light text-white px-8"
            >
              {isLoading ? 'Simplifying...' : 'Simplify Legal Text'}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Explanation Card */}
            <Card className="shadow-soft border-0">
              <CardHeader className="bg-teal/5">
                <CardTitle className="text-xl text-navy flex items-center">
                  <span className="w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                  Simplified Explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed">{result.explanation}</p>
              </CardContent>
            </Card>

            {/* Example Card */}
            <Card className="shadow-soft border-0">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-xl text-navy flex items-center">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                  Real-Life Example
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed">{result.example}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg text-gray-600">Simplifying your legal text...</span>
            </div>
          </div>
        )}

        {/* Sample Text */}
        {!result && !isLoading && (
          <Card className="shadow-soft border-0 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-navy mb-3">Try it with this sample legal text:</h3>
              <p className="text-sm text-gray-700 mb-4 italic">
                "The Party of the First Part hereby agrees and covenants to indemnify and hold harmless the Party of the Second Part from and against any and all claims, demands, actions, causes of action, suits, proceedings, judgments, orders, and decrees..."
              </p>
              <Button
                variant="outline"
                onClick={() => setLegalText("The Party of the First Part hereby agrees and covenants to indemnify and hold harmless the Party of the Second Part from and against any and all claims, demands, actions, causes of action, suits, proceedings, judgments, orders, and decrees, and all costs, expenses, and attorney's fees related thereto.")}
                className="border-teal text-teal hover:bg-teal hover:text-white"
              >
                Use Sample Text
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LawSimplify;
