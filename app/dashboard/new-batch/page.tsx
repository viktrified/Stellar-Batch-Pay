import { useState, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Send,
  Download,
  Info,
  Lightbulb,
  Check,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { parseInput } from "@/lib/stellar/parser";
import { getBatchSummary } from "@/lib/stellar/batcher";
import { PaymentInstruction } from "@/lib/stellar/types";
import { toast } from "sonner"; // Assuming sonner is used based on common patterns, if not I'll check

export default function NewBatchPaymentPage() {
  const [selectedNetwork, setSelectedNetwork] = useState<"testnet" | "mainnet">(
    "testnet",
  );
  const [file, setFile] = useState<File | null>(null);
  const [instructions, setInstructions] = useState<PaymentInstruction[]>([]);
  const [summary, setSummary] = useState<{
    recipientCount: number;
    validCount: number;
    invalidCount: number;
    totalAmount: string;
    assetBreakdown: Record<string, number>;
  } | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsParsing(true);

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const format = selectedFile.name.endsWith(".json") ? "json" : "csv";
          const parsedInstructions = parseInput(content, format);
          
          setInstructions(parsedInstructions);
          const batchSummary = getBatchSummary(parsedInstructions);
          setSummary(batchSummary);
          
          toast.success("File parsed successfully");
        } catch (error) {
          console.error("Failed to parse file:", error);
          toast.error(error instanceof Error ? error.message : "Failed to parse file");
          setInstructions([]);
          setSummary(null);
        } finally {
          setIsParsing(false);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const estimatedFees = summary ? (summary.recipientCount * 0.005).toFixed(3) : "0.000";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-slate-400 hover:text-white">
          Dashboard
        </Link>
        <span className="text-slate-600">&gt;</span>
        <span className="text-emerald-500">New Batch Payment</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          New Batch Payment
        </h1>
        <p className="text-slate-400">
          Upload a payment file and send multiple crypto transactions securely.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Payment File */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Upload Payment File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-12 text-center relative">
                {isParsing && (
                  <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center rounded-lg z-10">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-white text-sm font-medium">Parsing file...</p>
                    </div>
                  </div>
                )}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                    {file ? (
                      <Check className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <Upload className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">
                      {file ? file.name : "Drag and drop your file here"}
                    </p>
                    <p className="text-slate-400 text-sm mb-4">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : "or click to browse"}
                    </p>
                  </div>
                  <label htmlFor="file-upload">
                    <Button
                      type="button"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      disabled={isParsing}
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {file ? "Change File" : "Choose File"}
                    </Button>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".csv,.json"
                    onChange={handleFileChange}
                  />
                  <div className="text-xs text-slate-500 mt-2">
                    <p>Supported formats: CSV, JSON (Max 10MB)</p>
                    <button className="text-emerald-500 hover:text-emerald-400 flex items-center gap-1 mt-1 mx-auto">
                      <Download className="w-3 h-3" />
                      Download sample file
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Selection */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Network Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {/* Testnet */}
                <button
                  onClick={() => setSelectedNetwork("testnet")}
                  className={`relative p-6 rounded-lg border-2 transition-all text-left ${
                    selectedNetwork === "testnet"
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-700 bg-slate-950/50 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-lg">
                      Testnet
                    </h3>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedNetwork === "testnet"
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-slate-600"
                      }`}
                    >
                      {selectedNetwork === "testnet" && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Practice mode - No real funds
                  </p>
                </button>

                {/* Mainnet */}
                <button
                  onClick={() => setSelectedNetwork("mainnet")}
                  className={`relative p-6 rounded-lg border-2 transition-all text-left ${
                    selectedNetwork === "mainnet"
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-700 bg-slate-950/50 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-lg">
                      Mainnet
                    </h3>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedNetwork === "mainnet"
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-slate-600"
                      }`}
                    >
                      {selectedNetwork === "mainnet" && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <p className="text-yellow-500 text-sm">Real transactions</p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Transaction Summary */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Transaction Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Recipients</span>
                <span className="text-white font-semibold text-lg">
                  {summary ? summary.recipientCount : "0"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Valid Payments</span>
                <span className="text-emerald-500 font-semibold text-lg">
                  {summary ? summary.validCount : "0"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Invalid Payments</span>
                <span className="text-red-500 font-semibold text-lg">
                  {summary ? summary.invalidCount : "0"}
                </span>
              </div>
              <div className="border-t border-slate-800 pt-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">Estimated Fees</span>
                  <span className="text-white font-medium">{estimatedFees} XLM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Payout</span>
                  <span className="text-white font-bold text-xl">
                    {summary ? parseFloat(summary.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}{" "}
                    {summary && Object.keys(summary.assetBreakdown).length === 1 
                      ? Object.keys(summary.assetBreakdown)[0] 
                      : "XLM"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white text-base font-semibold"
            disabled={!summary || summary.validCount === 0 || isParsing}
          >
            <Send className="w-5 h-5 mr-2" />
            Submit Batch Payment
          </Button>

          {/* Info Messages */}
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-slate-400">
                Transactions are irreversible once submitted
              </p>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Info className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-slate-400">
                All payments are validated before processing
              </p>
            </div>
          </div>

          {/* Tips */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <CardTitle className="text-lg text-white">Tips</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-slate-400">
                  Use valid Stellar wallet addresses
                </p>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-slate-400">Verify amounts and asset types</p>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-slate-400">Test with small amounts first</p>
              </div>
              <button className="text-emerald-500 hover:text-emerald-400 text-sm flex items-center gap-1 mt-2">
                <BookOpen className="w-3 h-3" />
                View Documentation
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
