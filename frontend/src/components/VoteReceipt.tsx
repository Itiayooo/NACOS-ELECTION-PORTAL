import { motion } from 'framer-motion';
import { CheckCircle2, Download, LogOut } from 'lucide-react';
import { VotingReceipt } from '../types';

interface VoteReceiptProps {
  receipt: VotingReceipt[];
  onClose: () => void;
}

export default function VoteReceipt({ receipt, onClose }: VoteReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block"
          >
            <div className="bg-green-100 p-6 rounded-full mb-4">
              <CheckCircle2 className="w-20 h-20 text-green-600" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold text-nacos-green-800 font-display mb-2">
            Vote Submitted Successfully!
          </h1>
          <p className="text-gray-600">Your voting receipt is shown below</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          id="receipt"
          className="glass-card"
        >
          <div className="border-b-2 border-dashed border-gray-300 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 font-display mb-2">
              NACOS Election Receipt
            </h2>
            <p className="text-sm text-gray-600">
              Timestamp: {new Date(receipt[0]?.timestamp).toLocaleString()}
            </p>
          </div>

          <div className="space-y-4">
            {receipt.map((vote, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-nacos-green-600 flex-shrink-0">
                  <img
                    src={vote.candidatePhoto}
                    alt={vote.candidate}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {vote.office}
                  </div>
                  <div className="font-bold text-gray-800">{vote.candidate}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Level: {vote.level === 'college' ? 'College' : 'Department'}
                  </div>
                </div>

                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              </motion.div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800">
                <strong>Important:</strong> This is your official voting receipt. 
                You can download or print this for your records. Thank you for participating in the election!
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex gap-4 justify-center print:hidden"
        >
          <button
            onClick={handlePrint}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Receipt
          </button>
          
          <button
            onClick={onClose}
            className="btn-primary flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Exit
          </button>
        </motion.div>
      </motion.div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt, #receipt * {
            visibility: visible;
          }
          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
