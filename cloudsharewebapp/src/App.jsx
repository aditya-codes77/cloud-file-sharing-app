import { BrowserRouter, Routes ,Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/Upload";
import MyFiles from "./pages/MyFiles";
import Subscription from "./pages/Subscription";
import Transactions from "./pages/Transactions";
import PublicFile from "./pages/PublicFile";
import DashboardLayout from "./layout/DashboardLayout";
import { RedirectToSignIn, SignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Toaster } from 'react-hot-toast';


const App =()=>{

    return (
        <BrowserRouter>
        
        <Toaster/>

            <Routes>
                 <Route path="/" element={<Landing/>} />
                 <Route path="/public/:fileId" element={<PublicFile/>} />

                 <Route path="/dashboard" element={
                    <>
                       <SignedIn><DashboardLayout><Dashboard/></DashboardLayout></SignedIn>
                       <SignedOut><RedirectToSignIn/></SignedOut>
                    </>
                } />
                 <Route path="/Upload" element={
                    <>
                       <SignedIn><DashboardLayout><UploadPage/></DashboardLayout></SignedIn>
                       <SignedOut><RedirectToSignIn/></SignedOut>
                    </>
                 } />
                  <Route path="/myfiles" element={
                    <>
                       <SignedIn><DashboardLayout><MyFiles/></DashboardLayout></SignedIn>
                       <SignedOut><RedirectToSignIn/></SignedOut>
                    </>
                  } />
                   <Route path="/subscription" element={
                    <>
                       <SignedIn><DashboardLayout><Subscription/></DashboardLayout></SignedIn>
                       <SignedOut><RedirectToSignIn/></SignedOut>
                    </>
                   } />
                   <Route path="/transaction" element={
                    <>
                       <SignedIn><DashboardLayout><Transactions/></DashboardLayout></SignedIn>
                       <SignedOut><RedirectToSignIn/></SignedOut>
                    </>
                   } />
                   <Route path="/*" element={<RedirectToSignIn/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App;