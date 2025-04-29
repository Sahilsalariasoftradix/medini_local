import React from 'react';
import { TextField, FormHelperText, TextFieldProps, InputAdornment } from '@mui/material';
import { UseFormRegisterReturn } from 'react-hook-form';

interface CommonTextFieldProps extends Omit<TextFieldProps, 'name'> {
  register?: UseFormRegisterReturn; // Optional register prop
  errorMessage?: string; // Error message for validation
  startIcon?: React.ReactNode; // Accepts an icon component
  endIcon?: React.ReactNode; // Accepts an icon component
}

const CommonTextField: React.FC<CommonTextFieldProps> = ({
  register,
  errorMessage,
  startIcon,
  endIcon,
  ...props
}) => {
  return (
    <React.Fragment>
      <TextField 
        fullWidth 
      
        {...(register ?? {})} // Safely spread register if it exists
        error={!!errorMessage} 
        {...props} 
        slotProps={{
          input: {
            startAdornment: startIcon ? (
              <InputAdornment position="start">{startIcon}</InputAdornment>
            ) : null,
            endAdornment: endIcon ? (
              <InputAdornment position="end">{endIcon}</InputAdornment>
            ) : null,
          },
        }}
        
      />
      {errorMessage && (
        <FormHelperText  error>
          {errorMessage}
        </FormHelperText>
      )}
    </React.Fragment>
  );
};

export default CommonTextField;
