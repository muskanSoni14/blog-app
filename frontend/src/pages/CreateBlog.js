import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Button, InputLabel, TextField, Typography } from "@mui/material";
import toast from "react-hot-toast";

const CreateBlog = () => {
  const id = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    title: "",
    description: "",
    image: "",
  });

  // --- 1. ADD NEW STATE FOR LOADING ---
  const [loading, setLoading] = useState(false);

  // input change
  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  //form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- 2. UPDATE SUBMIT LOGIC ---
    setLoading(true); // Start loading
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/v1/blog/create-blog`, {
        title: inputs.title,
        description: inputs.description,
        image: inputs.image,
        user: id,
      });
      if (data?.success) {
        toast.success("Blog Created");
        navigate("/my-blogs");
      }
    } catch (error) {
      // Extract the specific error message from the backend
      const errorMessage = error.response?.data?.message || "An error occurred while creating the blog.";
      toast.error(errorMessage); // Display the error using react-hot-toast
      console.log(error);
    } finally {
      setLoading(false); // Stop loading in any case
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Box
            width={{ xs: '80%', sm: '70%', md: '35%' }}
            border={2}
            borderRadius={4}
            padding={2}
            margin="auto"
            marginTop="40px"
            boxShadow="5px 5px 15px #ccc"
            display="flex"
            flexDirection="column"
            bgcolor="white"
        >
            <Typography
                variant='h3'
                textAlign={'center'}
                fontWeight={"bold"}
                padding={2}
                color='gray'
            >
                Create a Post
            </Typography>
            <InputLabel
                sx={{ mb: 1, fontSize: "18px", fontWeight: "bold"}}
            >
                Title
            </InputLabel>
            <TextField 
                name='title' 
                value={inputs.title} 
                onChange={handleChange} 
                margin='normal' 
                variant='outlined'
                size="small"
                required
            />
            <InputLabel
                sx={{ mb: 1, fontSize: "18px", fontWeight: "bold"}}
            >
                Description
            </InputLabel>
            <TextField 
                name='description' 
                value={inputs.description} 
                onChange={handleChange} 
                margin='normal' 
                variant='outlined'
                size="small"
                required
            />
            <InputLabel
                sx={{ mb: 1, fontSize: "18px", fontWeight: "bold"}}
            >
                Image URL
            </InputLabel>
            <TextField 
                name='image' 
                value={inputs.image} 
                onChange={handleChange} 
                margin='normal' 
                variant='outlined'
                size="small"
                required
            />
            {/* --- 3. UPDATE BUTTON TO SHOW LOADING STATE --- */}
          <Button 
            type='submit' 
            color='primary' 
            variant='contained'
            sx={{ mt: 2 }} 
            disabled={loading} // Disable button when loading
          >
            {loading ? 'Submitting for Review...' : 'SUBMIT'}
          </Button>
        </Box>
      </form>
    </>
  );
};

export default CreateBlog;
