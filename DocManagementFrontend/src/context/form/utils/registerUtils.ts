import authService from '@/services/authService';
import { toast } from 'sonner';
import { FormData, SetStepValidation } from '../types';

export const prepareUserData = (formData: FormData) => {
  // Create the base user data
  const userData = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    passwordHash: formData.password,
    confirmPassword: formData.confirmPassword,
    username: formData.username,
    adminSecretKey: formData.adminSecretKey || '',
  };
  
  // Add user type specific data
  if (formData.userType === 'personal') {
    return {
      ...userData,
      userType: 'personal' as const, // Type assertion to narrow the type
      Identity: formData.cin || '',
      Address: formData.personalAddress || '',
      city: formData.city || '',
      country: formData.country || '',
      phoneNumber: formData.personalPhone || '',
    };
  } else {
    // Map company fields to the backend field names
    return {
      ...userData,
      userType: 'company' as const, // Type assertion to narrow the type
      firstName: formData.companyName || '', // Map company name to firstName
      Identity: formData.companyRC || '', // Map company RC to Identity
      phoneNumber: formData.companyPhone || '', // Map company phone to phoneNumber
      webSite: formData.companyWebsite || '', // Map company website to webSite
      Address: formData.companyAddress || '', // Map company address to Address
      city: formData.companyCity || '', // Map company city to city
      country: formData.companyCountry || '', // Map company country to country
      email: formData.companyEmail || formData.email || '', // Map company email to email
      username: formData.username || '', // username remains the same
      passwordHash: formData.password, // password remains the same but field renamed to passwordHash
    };
  }
};

export const registerUser = async (
  formData: FormData,
  setStepValidation: SetStepValidation,
  navigateFunction: (path: string, state?: any) => void
): Promise<boolean> => {
  setStepValidation((prev) => ({ ...prev, isLoading: true, errors: {} }));
  
  try {
    const userData = prepareUserData(formData);
    console.log("Sending registration data for userType:", formData.userType);
    console.log("Mapped registration data:", userData);
    
    const response = await authService.register(userData);
    console.log("Registration response:", response);
    
    setStepValidation((prev) => ({ ...prev, isLoading: false }));
    
    toast.success('Registration successful! Please check your email for verification.');
    
    // Navigate to success page instead of verification page directly
    navigateFunction('/registration-success', { 
      state: { email: formData.email }
    });
    
    return true;
  } catch (error: any) {
    console.error('Registration error:', error);
    
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.response) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data && typeof error.response.data.message === 'string') {
        errorMessage = error.response.data.message;
      } else if (error.response.data && typeof error.response.data.error === 'string') {
        errorMessage = error.response.data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setStepValidation((prev) => ({
      ...prev,
      isLoading: false,
      errors: { registration: errorMessage },
    }));
    
    toast.error(errorMessage);
    
    return false;
  }
};

export const verifyEmail = async (
  email: string,
  code: string,
  setStepValidation: SetStepValidation,
  navigateFunction: (path: string, state?: any) => void
): Promise<boolean> => {
  setStepValidation((prev) => ({ ...prev, isLoading: true, errors: {} }));
  try {
    const isVerified = await authService.verifyEmail(email, code);
    
    if (!isVerified) {
      setStepValidation((prev) => ({
        ...prev,
        isLoading: false,
        errors: { verification: 'Email verification failed. The code may be invalid or expired.' },
      }));
      toast.error('Email verification failed. The code may be invalid or expired.');
      return false;
    }
    
    setStepValidation((prev) => ({ ...prev, isLoading: false }));
    toast.success('Email verified successfully!');
    
    // Redirect to welcome page after successful verification
    navigateFunction('/welcome', { 
      state: { 
        verified: true,
        email: email
      }
    });
    
    return true;
  } catch (error: any) {
    console.error('Email verification error:', error);
    const errorMessage = error.response?.data?.message || 'Email verification failed.';
    setStepValidation((prev) => ({
      ...prev,
      isLoading: false,
      errors: { verification: errorMessage },
    }));
    toast.error(errorMessage);
    return false;
  }
};
