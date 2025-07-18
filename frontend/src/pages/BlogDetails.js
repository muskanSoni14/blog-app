import React,{useState, useEffect} from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, InputLabel, TextField, Typography } from '@mui/material';
import toast from 'react-hot-toast';

const BlogDetails = () => {
    const [blog, setBlog] = useState({});
    const id = useParams().id;
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({});

    
    //get blog details
    const getBlogDetail = async () => {
        try {
            const {data} = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/v1/blog/get-blog/${id}`);
            if(data?.success){
                setBlog(data?.blog);
                setInputs({
                    title:data?.blog.title,
                    description:data?.blog.description,
                    image:data?.blog.image,
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getBlogDetail()
    }, [id]);
    
    //input change
    const handleChange = (e) => {
        setInputs(prevState => ({
            ...prevState,
            [e.target.name] : e.target.value,
        }))
    }
    //form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const {data} = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/v1/blog/update-blog/${id}`, {
                title:inputs.title,
                description:inputs.description,
                image: inputs.image,
                user:id,
            });
            if(data?.success) {
                toast.success('Blog Updated');
                navigate("/my-blogs");
            }
        } catch (error) {
            console.log(error);
        }
    };
    console.log(blog);
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
            <Button 
                type='submit' 
                color='warning' 
                variant='contained'
                sx={{ mt: 2 }} 
            >
                UPDATE
            </Button>
        </Box>
        </form>
    </>
  );
};

export default BlogDetails;