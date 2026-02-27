import { Wallet } from 'lucide-react';

const CreditsDisplay = ({ credits }) => {
    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors cursor-pointer">
            <Wallet className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">{credits} credits</span>
        </div>
    );
};

export default CreditsDisplay;