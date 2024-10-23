import React from 'react';
import { Button, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface ButtonProps {
    handleClick: () => void;
}

const CustomButton: React.FC<ButtonProps> = (props) => {
  return (
    <Button
      onClick={props.handleClick}
      variant="contained"
      sx={{
        marginTop: '10px',
        borderRadius: '50px', // Rounded edges for the button
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        textTransform: 'none',
        backgroundColor: 'rgb(5, 88, 84)', // Customize button background color
        color: 'white',
        '&:hover': {
          backgroundColor: 'rgb(51, 51, 51)',
        },
      }}
    >
      {/* Circle with arrow inside */}
      <Box
        sx={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: '#fff', // Circle background color
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: '8px',
        }}
      >
        <ArrowBackIcon
          sx={{
            color: 'rgb(5, 88, 84)', // Arrow color matches button background color
            fontSize: '20px',
          }}
        />
      </Box>
      Takaisin
    </Button>
  );
};

export default CustomButton;
