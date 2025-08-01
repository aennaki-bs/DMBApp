import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMultiStepForm } from "@/context/form";
import RegisterForm from "./RegisterForm";
import {
  FileText,
  CheckCircle,
  Clock,
  Shield,
  Users,
  Database,
  User,
  Building2,
  MapPin,
  Mail,
  Lock,
  UserPlus,
  CheckSquare,
  ArrowRight,
  HelpCircle,
  Info,
  AlertCircle,
  PenLine,
  Key,
} from "lucide-react";

// Step-specific guidance content
const StepGuidance = () => {
  const { currentStep, formData } = useMultiStepForm();
  const isPersonal = formData.userType === "personal";

  // Guidance content for each step
  const stepContent = [
    // Step 0: Account Type
    {
      title: "Select Account Type",
      description: "Choose the type of account that best fits your needs",
      icon: <User className="h-6 w-6" />,
      tips: [
        {
          icon: <Users size={18} />,
          title: "Personal Account",
          content: "For individuals managing their own documents",
        },
        {
          icon: <Building2 size={18} />,
          title: "Company Account",
          content: "For companies with multiple team members",
        },
      ],
      note: "Your choice determines the features and permissions available to your account.",
    },
    // Step 1: Account Details
    {
      title: isPersonal ? "Personal Information" : "Company Information",
      description: isPersonal
        ? "Enter your personal details to set up your profile"
        : "Provide your company details for your organization profile",
      icon: <PenLine className="h-6 w-6" />,
      tips: isPersonal
        ? [
            {
              icon: <User size={18} />,
              title: "Full Name",
              content: "Enter your legal first and last name",
            },
            {
              icon: <FileText size={18} />,
              title: "ID Number",
              content:
                "Optional: Enter a government-issued ID for verification",
            },
          ]
        : [
            {
              icon: <Building2 size={18} />,
              title: "Company Name",
              content: "Enter your registered business name",
            },
            {
              icon: <FileText size={18} />,
              title: "Registration Number",
              content: "Enter your company's legal registration number",
            },
            {
              icon: <Database size={18} />,
              title: "Industry",
              content: "Select the industry that best matches your business",
            },
          ],
      note: "This information will be used to set up your account profile.",
    },
    // Step 2: Address
    {
      title: "Contact Information",
      description: "Provide your contact details for account communication",
      icon: <MapPin className="h-6 w-6" />,
      tips: [
        {
          icon: <MapPin size={18} />,
          title: "City",
          content: "Enter your city (required)",
        },
        {
          icon: <MapPin size={18} />,
          title: "Country",
          content: "Enter your country (required)",
        },
        {
          icon: <MapPin size={18} />,
          title: "Address",
          content: "Enter your complete physical address (optional)",
        },
        {
          icon: <Users size={18} />,
          title: "Phone Number",
          content: "Add a phone number for account verification (optional)",
        },
      ],
      note: "Only city and country are required. Other contact information is optional.",
    },
    // Step 3: Username & Email
    {
      title: "Account Credentials",
      description: "Set up your unique username and verified email address",
      icon: <Mail className="h-6 w-6" />,
      tips: [
        {
          icon: <User size={18} />,
          title: "Username",
          content: "Choose a unique username for logging in, it must be at least 4 characters long",
        },
        {
          icon: <Mail size={18} />,
          title: "Email Address",
          content: "Use a valid email that you have access to",
        },
        {
          icon: <AlertCircle size={18} />,
          title: "Verification",
          content: "We'll check if your username and email are available",
        },
      ],
      note: "You'll use these credentials to access your DMV account.",
    },
    // Step 4: Password
    {
      title: "Secure Password",
      description: "Create a strong password to protect your account",
      icon: <Lock className="h-6 w-6" />,
      tips: [
        {
          icon: <Shield size={18} />,
          title: "Strong Password",
          content: "Use uppercase, lowercase, numbers, and symbols",
        },
        {
          icon: <AlertCircle size={18} />,
          title: "Minimum Length",
          content: "Password should be at least 8 characters",
        },
        {
          icon: <CheckCircle size={18} />,
          title: "Confirmation",
          content: "Re-enter your password to ensure accuracy",
        },
      ],
      note: "Never share your password with anyone. Our staff will never ask for it.",
    },
    // Step 5: Admin Access
    {
      title: "Administrative Privileges",
      description: "Set up administrator access if applicable",
      icon: <Shield className="h-6 w-6" />,
      tips: [
        {
          icon: <Key size={18} />,
          title: "Admin Key",
          content: "Enter your organization's admin secret key if you have one",
        },
        {
          icon: <AlertCircle size={18} />,
          title: "Optional",
          content: "Skip this step if you don't need admin privileges",
        },
        {
          icon: <Shield size={18} />,
          title: "Elevated Access",
          content: "Admin users can manage other users and system settings",
        },
      ],
      note: "Admin privileges allow you to manage other users and system settings.",
    },
    // Step 6: Review
    {
      title: "Review Your Information",
      description: "Verify all details before completing registration",
      icon: <CheckSquare className="h-6 w-6" />,
      tips: [
        {
          icon: <User size={18} />,
          title: "Account Type & Personal Info",
          content: "Review your account type and personal/company details",
        },
        {
          icon: <MapPin size={18} />,
          title: "Contact Information",
          content: "Verify your address, city, country, and phone number",
        },
        {
          icon: <Mail size={18} />,
          title: "Account Credentials",
          content: "Check your username and email address",
        },
        {
          icon: <Shield size={18} />,
          title: "Security & Access",
          content: "Confirm password and access level settings",
        },
        {
          icon: <PenLine size={18} />,
          title: "Edit Sections",
          content: "Click 'Edit' on any section to make changes",
        },
      ],
      note: "Review each section carefully. You can edit any section by clicking the edit button before submitting.",
    },
  ];

  const variants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial="enter"
        animate="center"
        exit="exit"
        variants={variants}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
        }}
        className="space-y-6"
      >
        {/* Step Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-600/30 text-blue-300">
            {stepContent[currentStep].icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-100">
              {stepContent[currentStep].title}
            </h3>
            <p className="text-blue-300">
              {stepContent[currentStep].description}
            </p>
          </div>
        </div>

        {/* Tips Section */}
        <div className="space-y-4">
          {stepContent[currentStep].tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-start gap-3 bg-blue-900/30 rounded-lg p-4 backdrop-blur-sm border border-blue-500/20"
            >
              <div className="p-1.5 rounded-full bg-blue-800/50 text-blue-200">
                {tip.icon}
              </div>
              <div>
                <h4 className="font-medium text-blue-100">{tip.title}</h4>
                <p className="text-sm text-blue-300">{tip.content}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Note Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-3 bg-blue-800/20 rounded-lg p-4 border border-blue-700/30"
        >
          <div className="p-1 rounded-full bg-blue-700/30 text-blue-300 mt-0.5">
            <Info size={16} />
          </div>
          <p className="text-sm text-blue-300">
            {stepContent[currentStep].note}
          </p>
        </motion.div>

        {/* Animated Progress Indicator */}
        <motion.div
          className="w-full bg-blue-900/50 rounded-full h-1.5 mt-6"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
            initial={{ width: "5%" }}
            animate={{ width: `${Math.round(((currentStep + 1) / 6) * 100)}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const SplitScreenLayout = () => {
  const { currentStep } = useMultiStepForm();

  // Dynamic background patterns based on current step
  const getBgPattern = () => {
    switch (currentStep) {
      case 0:
        return "radial-gradient(circle at 70% 30%, rgba(37, 99, 235, 0.1) 0%, transparent 70%)";
      case 1:
        return "radial-gradient(circle at 30% 70%, rgba(37, 99, 235, 0.1) 0%, transparent 70%)";
      case 2:
        return "radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 70%)";
      case 3:
        return "radial-gradient(circle at 80% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 70%)";
      case 4:
        return "radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.1) 0%, transparent 70%)";
      case 5:
        return "radial-gradient(circle at 60% 80%, rgba(37, 99, 235, 0.1) 0%, transparent 70%)";
      case 6:
        return "radial-gradient(circle at 40% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 70%)";
      default:
        return "none";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-b from-[#0a1033] to-[#040714] overflow-hidden">
      {/* Left side - Registration Form */}
      <div className="w-full lg:w-1/2 overflow-y-auto max-h-screen">
        <RegisterForm />
      </div>

      {/* Right side - Dynamic guide with step-specific content */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-10 transition-all duration-500">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')",
            }}
          ></div>
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#0a1033]/90 to-[#081640]/90"
            style={{
              backgroundImage: getBgPattern(),
            }}
          ></div>

          {/* Animated elements in background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute w-72 h-72 rounded-full bg-blue-900/20 blur-[80px]"
              animate={{
                x: ["-20%", "10%", "-10%"],
                y: ["5%", "15%", "0%"],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              style={{ top: "20%", left: "30%" }}
            />
            <motion.div
              className="absolute w-96 h-96 rounded-full bg-indigo-900/20 blur-[100px]"
              animate={{
                x: ["10%", "-15%", "5%"],
                y: ["0%", "10%", "-10%"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              style={{ bottom: "10%", right: "20%" }}
            />
          </div>
        </div>

        {/* Content overlay with dynamic guidance */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-10 overflow-y-auto">
          <div>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-white mb-3">
                Welcome to DM<span className="text-docuBlue">V</span>
              </h2>
              <p className="text-xl text-blue-200">
                Document Management Verse
              </p>
              <motion.div
                className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mt-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "120px" }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-semibold text-blue-100">
                  Registration Guide
                </h3>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="opacity-60"
                >
                  <div className="w-6 h-6 rounded-full border-2 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent" />
                </motion.div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-blue-300">Step {currentStep + 1} of 7</p>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-blue-500/50 to-transparent"></div>
              </div>
            </motion.div>

            {/* Dynamic Step Guidance */}
            <StepGuidance />
          </div>

          {/* Bottom info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="mt-auto pt-6"
          >
            <div className="flex items-center gap-2 text-blue-300 text-sm">
              <Shield size={16} className="text-blue-400" />
              <span>Your data is protected by enterprise-grade security</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SplitScreenLayout;