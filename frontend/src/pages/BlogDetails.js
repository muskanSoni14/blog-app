import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, InputLabel, TextField, Typography, Stack } from '@mui/material';
import toast from 'react-hot-toast';

const BlogDetails = () => {
    const [blog, setBlog] = useState({});
    const id = useParams().id;
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({
        title: '',
        description: '',
        image: '',
    });

    // --- STATES FOR LOADING ---
    const [loading, setLoading] = useState(false); // For main submit button
    const [titleLoading, setTitleLoading] = useState(false); // For AI button
    const [aiTitles, setAiTitles] = useState([]);
    const MIN_CHARS = 40; // Or your preferred length

    //get blog details
    const getBlogDetail = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/v1/blog/get-blog/${id}`);
            if (data?.success) {
                setBlog(data?.blog);
                setInputs({
                    title: data?.blog.title,
                    description: data?.blog.description,
                    image: data?.blog.image,
                });
            }
        } catch (error) {
            console.log(error);
            toast.error('Could not load blog details.');
        }
    }

    useEffect(() => {
        getBlogDetail();
    // eslint-disable-next-line
    }, [id]);

    //input change
    const handleChange = (e) => {
        setInputs(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }

    // --- FUNCTION FOR AI TITLE GENERATION ---
    const handleGenerateTitles = async () => {
        setTitleLoading(true);
        setAiTitles([]); // Clear old titles
        try {
            const { data } = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/v1/blog/generate-titles`,
                {
                    text: inputs.description, // Send the current description
                }
            );
            if (data?.titles) {
                setAiTitles(data.titles);
                toast.success("Titles generated!");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Error generating titles.";
            toast.error(errorMessage);
        } finally {
            setTitleLoading(false);
        }
    };

    // --- FORM SUBMIT FOR UPDATING BLOG ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading
        try {
            const { data } = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/v1/blog/update-blog/${id}`, {
                title: inputs.title,
                description: inputs.description,
                image: inputs.image,
            });
            if (data?.success) {
                toast.success('Blog Updated Successfully!');
                navigate("/my-blogs");
            }
        } catch (error) {
            // This will catch moderation errors from your backend
            const errorMessage =
                error.response?.data?.message || "An error occurred while updating.";
            toast.error(errorMessage);
            console.log(error);
        } finally {
            setLoading(false); // Stop loading
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
                        Update Post
                    </Typography>
                    
                    <InputLabel
                        sx={{ mb: 1, fontSize: "18px", fontWeight: "bold" }}
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

                    {/* --- AI TITLE SUGGESTIONS STACK --- */}
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1, mb: 1 }}>
                        {aiTitles.map((title, index) => (
                            <Button
                                key={index}
                                variant="outlined"
                                size="small"
                                onClick={() =>
                                    setInputs((prevState) => ({ ...prevState, title: title }))
                                }
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "16px",
                                    fontSize: "0.75rem",
                                }}
                            >
                                {title}
                            </Button>
                        ))}
                    </Stack>

                    <InputLabel
                        sx={{ mb: 1, fontSize: "18px", fontWeight: "bold" }}
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
                        multiline
                        rows={5}
                    />

                    {/* --- GENERATE TITLES BUTTON --- */}
                    <Button
                        variant="contained"
                        onClick={handleGenerateTitles}
                        disabled={inputs.description.length < MIN_CHARS || titleLoading}
                        sx={{
                            mt: 1,
                            mb: 2,
                            background: 'linear-gradient(45deg, #0288d1 30%, #26c6da 90%)',
                            color: 'white',
                            '&:disabled': {
                                background: 'rgba(0, 0, 0, 0.12)',
                            }
                        }}
                    >
                        {titleLoading
                            ? "Generating..."
                            : inputs.description.length < MIN_CHARS
                                ? `Need ${MIN_CHARS - inputs.description.length
                                } more chars...`
                                : "Generate Titles with AI"}
                    </Button>

                    <InputLabel
                        sx={{ mb: 1, fontSize: "18px", fontWeight: "bold" }}
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

                    {/* --- SUBMIT BUTTON --- */}
                    <Button
                        type='submit'
                        color='warning'
                        variant='contained'
                        sx={{ mt: 2 }}
                        disabled={loading} // Add disabled state
                    >
                        {loading ? 'UPDATING...' : 'UPDATE'} 
                    </Button>
                </Box>
            </form>
        </>
    );
};

export default BlogDetails;