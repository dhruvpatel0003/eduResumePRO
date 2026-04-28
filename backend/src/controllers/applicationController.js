const Application = require('../models/Application');
const JobOpening = require('../models/JobOpening');

// Create a new application (Student)
exports.createApplication = async (req, res) => {
  try {
    const { jobOpeningId, resumeId, coverLetter } = req.body;
    
    // Check if job exists
    const job = await JobOpening.findById(jobOpeningId);
    if (!job) {
      return res.status(404).json({ message: 'Job opening not found' });
    }

    // Check if user already applied to this job
    const existingApp = await Application.findOne({
      user: req.userId,
      jobOpeningId
    });

    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = new Application({
      user: req.userId,
      jobOpeningId,
      resumeId,
      // If the frontend also sends a cover letter, we can store it in feedback for now, 
      // or we can just ignore it until the schema is explicitly expanded.
    });

    await application.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ message: 'Error submitting application' });
  }
};

// Get all applications for the logged-in user
exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.userId })
      .populate('jobOpeningId', 'title company location type')
      .populate('resumeId', 'title')
      .sort({ appliedDate: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
};

// Get a single application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.userId // Ensure user owns the application (or is admin, but for now just owner)
    })
      .populate('jobOpeningId')
      .populate('resumeId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ message: 'Error fetching application' });
  }
};

// Update application status (For recruiters/admins/system)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, score, feedback, interviewDate } = req.body;
    
    // In a real system, we'd verify the user is a recruiter or admin here
    
    const updateData = {};
    if (status) updateData.status = status;
    if (score !== undefined) updateData.score = score;
    if (feedback) updateData.feedback = feedback;
    if (interviewDate) updateData.interviewDate = interviewDate;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application' });
  }
};

// Delete/Withdraw application
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.userId // Only allow user to withdraw their own application
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    await Application.deleteOne({ _id: req.params.id });

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Error withdrawing application' });
  }
};
