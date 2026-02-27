import FeaturesSection from "../components/Landing/FeatureSection";
import CTASection from "../components/Landing/CTASection";
import Footer from "../components/Landing/Footer";
import HeroSection from "../components/Landing/HeroSection";
import PricingSection from "../components/Landing/PricingSection";
import TestimonialsSection from "../components/Landing/TestimonialsSection";
import { features, pricingPlans, testimonials } from "../assets/data";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";



const Landing  = () => {
    const {openSignIn, openSignUp} = useClerk();
    const {isSignedIn } = useUser();
    const navigate = useNavigate();

    useEffect(() =>{
        if (isSignedIn) {
            navigate("/dashboard");
        }
    },[isSignedIn, navigate]);

    return(
        <div className="Landing-page bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Hero Section */}
            <HeroSection openSignIn={openSignIn} openSignUp={openSignUp}/>

            {/* Features Section */}
            <FeaturesSection features={features} />

            {/* Prices Section */}
            <PricingSection  pricingPlans={pricingPlans} openSignUp={openSignUp} />

            {/* Testimonials Section */}
            <TestimonialsSection Testimonials={testimonials}/>

            {/* CTA Section */}
            <CTASection openSignUp={openSignUp}/>

            {/* Footer Section */}
            <Footer/>
        </div>
    )
}

export default Landing;