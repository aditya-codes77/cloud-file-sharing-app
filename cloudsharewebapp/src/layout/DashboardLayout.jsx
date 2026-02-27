import { useUser, UserButton } from "@clerk/clerk-react";
import SideMenu from "../components/SideMenu";
import CreditsDisplay from "../components/CreditsDisplay";
import { useState, useEffect } from "react";
import { Menu, X, Share2 } from "lucide-react";
import { getCredits } from "../utils/credits";

const DashboardLayout = ({children}) => {
    const {user} = useUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [credits, setCredits] = useState(0);

    useEffect(() => {
        const userId = user?.id || 'default';
        setCredits(getCredits(userId));
        
        const handleCreditsUpdate = () => {
            setCredits(getCredits(userId));
        };
        window.addEventListener('creditsUpdated', handleCreditsUpdate);
        return () => window.removeEventListener('creditsUpdated', handleCreditsUpdate);
    }, [user]);
    
    return (
    <div>
        {/* Navbar */}
        <div className="h-[61px] bg-white border-b border-gray-200 flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button 
                    className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <div className="flex items-center gap-2">
                    <Share2 className="w-6 h-6 text-purple-600" />
                    <h1 className="text-xl font-semibold text-gray-800">CloudShare</h1>
                </div>
            </div>
            
            {/* Top Right Section */}
            {user && (
                <div className="flex items-center gap-4">
                    {/* Credits Display */}
                    <CreditsDisplay credits={credits} />
                    
                    {/* User Button with Clerk Authentication Options */}
                    <UserButton 
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                avatarBox: "w-8 h-8"
                            }
                        }}
                        userProfileMode="modal"
                    />
                </div>
            )}
        </div>
        
        {user && (
            <div className="flex relative">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block">
                    <SideMenu/>
                </div>
                
                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <>
                        <div 
                            className="lg:hidden fixed top-[61px] left-0 right-0 bottom-0 bg-white bg-opacity-50 z-40"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <div className="lg:hidden fixed left-0 top-[61px] z-50">
                            <SideMenu onNavigate={() => setIsMobileMenuOpen(false)}/>
                        </div>
                    </>
                )}
                
                {/* Main Content */}
                <div className="flex-1 p-5">{children}</div> 
            </div>
        )}
    </div>
    )
}

export default DashboardLayout;