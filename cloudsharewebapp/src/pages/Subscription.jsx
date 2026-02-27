import { useState } from 'react';
import toast from 'react-hot-toast';
import { addTransaction } from '../utils/transactions';
import { addCredits } from '../utils/credits';
import { useUser } from '@clerk/clerk-react';

const Subscription = () => {
    const [currentPlan, setCurrentPlan] = useState('free'); // free, pro, enterprise
    const { user } = useUser();
    
    const plans = [
        {
            id: 'free',
            name: 'Free Plan',
            price: 0,
            period: 'forever',
            storage: '5 GB',
            features: [
                'Up to 5 GB storage',
                'Basic file sharing',
                'Public & private files',
                'Standard support',
                'Mobile app access'
            ],
            color: 'gray',
            popular: false
        },
        {
            id: 'pro',
            name: 'Pro Plan',
            price: 499,
            period: 'month',
            storage: '100 GB',
            features: [
                'Up to 100 GB storage',
                'Advanced file sharing',
                'Password protected files',
                'Priority support',
                'Custom branding',
                'Advanced analytics',
                'Team collaboration'
            ],
            color: 'purple',
            popular: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise Plan',
            price: 1999,
            period: 'month',
            storage: 'Unlimited',
            features: [
                'Unlimited storage',
                'Advanced security',
                'SSO integration',
                'Dedicated support',
                'Custom integrations',
                'Advanced compliance',
                'Admin controls',
                'API access'
            ],
            color: 'blue',
            popular: false
        }
    ];

    const handleUpgrade = (planId) => {
        if (planId === currentPlan) {
            toast('You are already on this plan', { icon: 'ℹ️' });
            return;
        }

        const selectedPlan = plans.find(p => p.id === planId);
        const userId = user?.id || 'default';
        
        // In production, this would integrate with payment gateway
        toast.success(`Upgrading to ${selectedPlan.name}...`);
        
        // Simulate upgrade
        setTimeout(() => {
            setCurrentPlan(planId);
            
            // Add transaction and credits for subscription purchase
            if (selectedPlan.price > 0) {
                addTransaction(
                    'subscription',
                    `Purchased ${selectedPlan.name}`,
                    0,
                    selectedPlan.price,
                    userId
                );
                // Add credits based on plan price
                addCredits(selectedPlan.price, userId);
            }
            
            toast.success('Plan upgraded successfully!');
        }, 1500);
    };

    return (
        <div className="p-4 min-h-screen overflow-hidden" style={{backgroundColor: '#f5efff'}}>
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-normal mb-2">
                    Subscription Plans
                </h1>
                <p className="text-gray-600 mb-8">
                    Choose the perfect plan for your needs
                </p>

                {/* Current Plan Banner */}
                <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg shadow-sm p-6 mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90 mb-1">Your Current Plan</p>
                            <p className="text-2xl font-bold">
                                {plans.find(p => p.id === currentPlan)?.name}
                            </p>
                            <p className="text-sm opacity-90 mt-2">
                                Storage: {plans.find(p => p.id === currentPlan)?.storage}
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {plans.map((plan) => (
                        <div 
                            key={plan.id}
                            className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md ${
                                plan.popular ? 'ring-2 ring-purple-400' : ''
                            }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="bg-purple-400 text-white text-xs font-semibold text-center py-2">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="p-6">
                                {/* Plan Header */}
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        {plan.name}
                                    </h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-bold text-gray-900">
                                            ₹{plan.price}
                                        </span>
                                        {plan.period !== 'forever' && (
                                            <span className="text-gray-500 text-sm">/{plan.period}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {plan.storage} storage
                                    </p>
                                </div>

                                {/* Features List */}
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm">
                                            <svg 
                                                width="16" 
                                                height="16" 
                                                viewBox="0 0 24 24" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                className={`flex-shrink-0 mt-0.5 ${
                                                    plan.color === 'purple' ? 'text-purple-500' : 
                                                    plan.color === 'blue' ? 'text-blue-500' : 
                                                    'text-gray-400'
                                                }`}
                                            >
                                                <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Action Button */}
                                <button
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={currentPlan === plan.id}
                                    className={`w-full py-3 rounded-lg font-medium transition ${
                                        currentPlan === plan.id
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : plan.popular
                                            ? 'bg-purple-400 hover:bg-purple-600 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                    }`}
                                >
                                    {currentPlan === plan.id ? 'Current Plan' : 
                                     plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ / Info Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Frequently Asked Questions
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-800 mb-1">
                                Can I upgrade or downgrade anytime?
                            </h3>
                            <p className="text-sm text-gray-600">
                                Yes! You can change your plan at any time. Changes take effect immediately, 
                                and we'll prorate the charges accordingly.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-800 mb-1">
                                What happens to my files if I downgrade?
                            </h3>
                            <p className="text-sm text-gray-600">
                                Your files remain safe. If you exceed the storage limit of your new plan, 
                                you'll need to delete some files or upgrade again to upload new ones.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-800 mb-1">
                                Do you offer refunds?
                            </h3>
                            <p className="text-sm text-gray-600">
                                Yes, we offer a 30-day money-back guarantee for all paid plans. 
                                Contact our support team for assistance.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Support */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-500 flex-shrink-0">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">Need help choosing?</p>
                            <p className="text-sm text-blue-700">
                                Contact our sales team for personalized recommendations and custom enterprise plans.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
