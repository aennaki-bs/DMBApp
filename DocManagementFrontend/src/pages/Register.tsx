
import React from 'react';
import { MultiStepFormProvider } from '@/context/form';
import RegisterForm from './register/RegisterForm';
import GlobalStyles from './register/GlobalStyles';

const Register = () => {
  return (
    <MultiStepFormProvider>
      <GlobalStyles />
      <RegisterForm />
    </MultiStepFormProvider>
  );
};

export default Register;
