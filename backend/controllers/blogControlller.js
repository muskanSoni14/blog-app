const mongoose = require('mongoose');
const blogModel = require('../models/blogModel');
const userModel = require('../models/userModel');

//Get All Blogs
exports.getAllBlogsController = async (req, res) => {
    try {
        const blogs = await blogModel.find({}).populate('user');
        if(!blogs) {
            return res.status(200).send({
                success: false,
                message: 'No Blogs Found',
            });
        }
        return res.status(200).send({
            success: true,
            BlogCount: blogs.length,
            message: 'All Blogs lists',
            blogs,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: 'Error while Getting Blogs',
            error
        });
    }
};

//Create Blog
exports.createBlogController = async (req, res) => {
    try {
        const { title,description,image,user } = req.body;
        //validation
        if( !title || !description || !image || !user ) {
            return res.status(400).send({
                success: false,
                message: 'Please Provide All Fields',
            });
        }
        const existingUser = await userModel.findById(user)
        //validation
        if(!existingUser) {
            return res.status(404).send({
                success: false,
                message: 'Unable to find user'
            })
        }
        const newBlog = new blogModel({title, description, image, user });
        const session = await mongoose.startSession()
        session.startTransaction()
        await newBlog.save({session})
        existingUser.blogs.push(newBlog)
        await existingUser.save({session})
        await session.commitTransaction();
        await newBlog.save();
        return res.status(201).send({
            success: true,
            message: 'Blog Created!',
            newBlog,
        });
    } catch (error) {
        console.log(error)
        return res.status(400).send({
            success: false,
            message: 'Error while Creating Blog',
            error,
        });
    }
};

//Update Blog
exports.updateBlogController = async (req, res) => {
    try {
        const {id} = req.params;
        const{title, description, image} = req.body;
        const blog = await blogModel.findByIdAndUpdate(
            id,
            {...req.body},
            {new: true}
        );
        return res.status(200).send({
            success: true,
            message: 'Blog Updated',
            blog,
        });
    } catch (error) {
        console.log(error)
        return res.status(400).send({
            success: false,
            message: 'Error while Updating Blog',
            error,
        });
    }
};

//Single Blog
exports.getBlogByIdController = async (req, res) => {
    try {
        const {id} = req.params;
        const blog = await blogModel.findById(id);
        if(!blog) {
            return res.status(404).send({
            success: false,
            message: 'Blog not found with this id',
          });
        }
        return res.status(200).send({
            success: true,
            message: 'Fetch Single Blog',
            blog,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: 'Error while Getting Single Blog',
            error,
        });
    }
};

//Delete Blog
exports.deleteBlogController = async (req, res) => {
    try {
        const blog = await blogModel.findByIdAndDelete(req.params.id).populate("user");
        await blog.user.blogs.pull(blog);
        await blog.user.save();
        return res.status(200).send({
            success: true,
            message: 'Blog Deleted!',
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: 'Error while Deleting Blog',
            error,
        });
    }
};

// GET USER BLOG
exports.userBlogController = async (req, res) => {
    try {
        const userBlog = await userModel.findById(req.params.id).populate("blogs");
        if(!userBlog) {
            return res.status(404).send({
            success: false,
            message: 'Blogs not found with this id',
            });
        }
        return res.status(200).send({
            success: true,
            message: 'User Blogs',
            userBlog,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: 'Error in use blog',
            error,
        });
    }
};