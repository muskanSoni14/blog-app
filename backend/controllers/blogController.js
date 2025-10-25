const { moderateContent } = require('../services/aiModerator');
const { generateTitles } = require('../services/aiTitle');
const mongoose = require('mongoose');
const blogModel = require('../models/blogModel');
const userModel = require('../models/userModel');
const validator = require('validator');

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

exports.createBlogController = async (req, res) => {
    try {
        const { title, description, image, user } = req.body;
        //validation
        if (!title || !description || !image || !user) {
            return res.status(400).send({
                success: false,
                message: 'Please Provide All Fields',
            });
        }

            // THIS IS VALIDATION BLOCK
        if (!validator.isURL(image)) {
            return res.status(400).send({
                success: false,
                message: 'Please provide a valid image URL.'
            });
        }

        const contentToCheck = `${title}\n\n${description}`;

        // --- NEW LOGGING LINES ---
        console.log("--- MODERATION: Sending content to AI for review. ---");
        const moderationResult = await moderateContent(contentToCheck);
        console.log("--- MODERATION: AI verdict received: ---", moderationResult);
        // --- END OF LOGGING LINES ---

        if (!moderationResult.is_safe_to_post) {
            return res.status(400).send({
                success: false,
                message: 'Your blog could not be created due to content policy violations.',
                violations: moderationResult.violations_found,
            });
        }

        const existingUser = await userModel.findById(user);
        if (!existingUser) {
            return res.status(404).send({
                success: false,
                message: 'Unable to find user'
            });
        }

        const newBlog = new blogModel({ title, description, image, user });
        const session = await mongoose.startSession();
        session.startTransaction();
        await newBlog.save({ session });
        existingUser.blogs.push(newBlog);
        await existingUser.save({ session });
        await session.commitTransaction();


        return res.status(201).send({
            success: true,
            message: 'Blog Created!',
            newBlog,
        });
    } catch (error) {
        console.log(error);
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

//Update Blog
exports.updateBlogController = async (req, res) => {
    try {
        const {id} = req.params;
        const{title, description, image} = req.body;

        // --- 1. BASIC VALIDATION ---
        if (!title || !description || !image) {
            return res.status(400).send({
                success: false,
                message: 'Please provide title, description, and image',
            });
        }

        // --- 2. IMAGE URL VALIDATION ---
        if (!validator.isURL(image)) {
            return res.status(400).send({
                success: false,
                message: 'Please provide a valid image URL.'
            });
        }
        
        // --- 3. AI MODERATION ---
        const contentToModerate = `${title}\n\n${description}`;
        console.log("--- MODERATION (UPDATE): Sending content to AI for review. ---");
        const moderationResult = await moderateContent(contentToModerate);
        console.log("--- MODERATION (UPDATE): AI verdict received: ---", moderationResult);

        if (!moderationResult.is_safe_to_post) {
            // Block the update if it's not safe
            return res.status(400).send({
                success: false,
                // Send the specific reason to the frontend
                message: moderationResult.violations_found[0].details,
            });
        }

        // --- 4. IF ALL CHECKS PASS, UPDATE THE BLOG ---
        const blog = await blogModel.findByIdAndUpdate(
            id,
            {...req.body}, // This is { title, description, image }
            {new: true}
        );

        return res.status(200).send({
            success: true,
            message: 'Blog Updated Successfully!',
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

exports.generateTitlesController = async (req, res) => {
  try {
    const { text } = req.body;
    // 1. Check for input
    if (!text || text.length < 40) { 
      return res.status(400).send({
        success: false,
        message: 'Blog content is too short to generate titles.',
      });
    }

    // --- 2. THIS IS MODERATION STEP ---
    console.log("--- TITLE GEN: Moderating content before generating titles. ---");
    const moderationResult = await moderateContent(text);

    if (!moderationResult.is_safe_to_post) {
        return res.status(400).send({
            success: false,
            // Send the specific reason to the frontend toast
            message: moderationResult.violations_found[0].details, 
        });
    }
    // --- END OF NEW STEP ---

    // 3. Call your AI function (only if safe)
    console.log("--- TITLE GEN: Content is safe, generating titles. ---");
    const titles = await generateTitles(text);

    // 4. Send the titles back to the frontend
    return res.status(200).send({
      success: true,
      message: 'Titles generated successfully',
      titles: titles, // This is the [ "title1", "title2" ] array
    });

  } catch (error) {
    console.log("Error in AI Title Generation:", error);
    return res.status(500).send({
      success: false,
      message: 'Error generating titles via AI',
      error: error.message,
    });
  }
};