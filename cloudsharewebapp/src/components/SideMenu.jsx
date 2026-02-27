import { useUser } from "@clerk/clerk-react";
import { Side_Menu_Data } from "../assets/data";
import { NavLink } from "react-router-dom";
import { Wallet } from "lucide-react";

const SideMenu =({ onNavigate }) =>{
    const {user, isLoaded} = useUser();
    

    
    if (!isLoaded) {
        return (
            <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20">
                <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20">
            {/* User Profile Section */}
            <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
                {user?.imageUrl ? (
                    <img src={user?.imageUrl || ""} alt="Profile image" className="w-20 h-20 bg-slate-400 rounded-full"/>
                ):(
                    <div className="w-20 h-20 bg-slate-400 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                        {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || "U"}
                    </div>
                )}
                <div className="text-center">
                    <h3 className="font-semibold text-gray-800">
                        {user?.fullName || 
                         (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                         user?.firstName || 
                         user?.lastName ||
                         user?.username || 
                         (user?.primaryEmailAddress?.emailAddress ? 
                            user.primaryEmailAddress.emailAddress.split('@')[0] : 
                            user?.emailAddresses?.[0]?.emailAddress?.split('@')[0]
                         ) || 
                         "User"}
                    </h3>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="space-y-2">
                {Side_Menu_Data.map((item) => {
                    const IconComponent = item.icon;
                    
                    return (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            onClick={() => onNavigate && onNavigate()}
                            className={({ isActive }) => 
                                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    isActive 
                                        ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-500' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`
                            }
                        >
                            <IconComponent className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    )
}
export default SideMenu;