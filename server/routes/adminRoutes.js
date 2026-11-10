// const express = require('express');
// const router = express.Router();
// const Project = require('../models/Project');
// const { decrypt } = require('../utils/encryption');

// // Simple admin middleware (email-based check)
// // In production, you'd use proper JWT validation
// const isAdmin = (req, res, next) => {
//   const adminEmail = req.headers['admin-email'];
  
//   if (adminEmail !== 'admin@universityhub.com') {
//     return res.status(403).json({
//       success: false,
//       message: 'Access denied. Admin only.'
//     });
//   }
  
//   next();
// };

// // @route   GET /api/admin/projects/pending
// // @desc    Get all pending projects
// // @access  Admin only
// router.get('/projects/pending', isAdmin, async (req, res) => {
//   try {
//     const pendingProjects = await Project.find({ status: 'pending' })
//       .sort({ createdAt: -1 });
    
//     // Decrypt file URLs for admin preview
//     const decryptedProjects = pendingProjects.map(project => {
//       const projectObj = project.toObject();
      
//       // Decrypt PDF URL
//       if (projectObj.pdfUrl) {
//         try {
//           projectObj.pdfUrl = decrypt(projectObj.pdfUrl);
//           console.log('Decrypted PDF URL:', projectObj.pdfUrl); // Debug log
//         } catch (error) {
//           console.error('PDF decryption error for project:', projectObj._id, error.message);
//           projectObj.pdfUrl = null;
//         }
//       }
      
//       // Decrypt Video URL
//       if (projectObj.videoUrl) {
//         try {
//           projectObj.videoUrl = decrypt(projectObj.videoUrl);
//           console.log('Decrypted Video URL:', projectObj.videoUrl); // Debug log
//         } catch (error) {
//           console.error('Video decryption error for project:', projectObj._id, error.message);
//           projectObj.videoUrl = null;
//         }
//       }
      
//       return projectObj;
//     });
    
//     res.json({
//       success: true,
//       count: decryptedProjects.length,
//       data: decryptedProjects
//     });
//   } catch (error) {
//     console.error('Route error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// });

// // @route   GET /api/admin/projects/all
// // @desc    Get all projects with optional status filter
// // @access  Admin only
// router.get('/projects/all', isAdmin, async (req, res) => {
//   try {
//     const { status } = req.query;
//     let query = {};
    
//     // If status is provided and not 'all', filter by status
//     if (status && status !== 'all') {
//       query.status = status;
//     }
    
//     const projects = await Project.find(query)
//       .sort({ createdAt: -1 });
    
//     // Decrypt file URLs for admin preview
//     const decryptedProjects = projects.map(project => {
//       const projectObj = project.toObject();
      
//       if (projectObj.pdfUrl) {
//         try {
//           projectObj.pdfUrl = decrypt(projectObj.pdfUrl);
//         } catch (error) {
//           console.error('PDF decryption error:', error);
//           projectObj.pdfUrl = null;
//         }
//       }
      
//       if (projectObj.videoUrl) {
//         try {
//           projectObj.videoUrl = decrypt(projectObj.videoUrl);
//         } catch (error) {
//           console.error('Video decryption error:', error);
//           projectObj.videoUrl = null;
//         }
//       }
      
//       return projectObj;
//     });
    
//     res.json({
//       success: true,
//       count: decryptedProjects.length,
//       data: decryptedProjects
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// });

// // @route   PUT /api/admin/projects/:id/approve
// // @desc    Approve a project
// // @access  Admin only
// router.put('/projects/:id/approve', isAdmin, async (req, res) => {
//   try {
//     const { adminEmail } = req.body;
    
//     const project = await Project.findById(req.params.id);
    
//     if (!project) {
//       return res.status(404).json({
//         success: false,
//         message: 'Project not found'
//       });
//     }
    
//     project.status = 'approved';
//     project.approvedBy = adminEmail || 'admin@universityhub.com';
//     await project.save();
    
//     res.json({
//       success: true,
//       message: 'Project approved successfully',
//       data: project
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to approve project',
//       error: error.message
//     });
//   }
// });

// // @route   PUT /api/admin/projects/:id/reject
// // @desc    Reject a project
// // @access  Admin only
// router.put('/projects/:id/reject', isAdmin, async (req, res) => {
//   try {
//     const { reason } = req.body;
    
//     const project = await Project.findById(req.params.id);
    
//     if (!project) {
//       return res.status(404).json({
//         success: false,
//         message: 'Project not found'
//       });
//     }
    
//     project.status = 'rejected';
//     project.rejectionReason = reason || 'Does not meet quality standards';
//     await project.save();
    
//     res.json({
//       success: true,
//       message: 'Project rejected',
//       data: project
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to reject project',
//       error: error.message
//     });
//   }
// });

// // @route   DELETE /api/admin/projects/:id
// // @desc    Delete a project permanently
// // @access  Admin only
// router.delete('/projects/:id', isAdmin, async (req, res) => {
//   try {
//     const project = await Project.findByIdAndDelete(req.params.id);
    
//     if (!project) {
//       return res.status(404).json({
//         success: false,
//         message: 'Project not found'
//       });
//     }
    
//     // Delete associated files from Cloudflare R2
//     if (project.pdfUrl) { try { deleteFileFromR2(decrypt(project.pdfUrl)); } catch (_) {} }
//     if (project.videoUrl) { try { deleteFileFromR2(decrypt(project.videoUrl)); } catch (_) {} }
//     if (project.zipUrl) { try { deleteFileFromR2(project.zipUrl); } catch (_) {} }
    
//     res.json({
//       success: true,
//       message: 'Project deleted successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete project',
//       error: error.message
//     });
//   }
// });

// // @route   GET /api/admin/stats
// // @desc    Get dashboard statistics
// // @access  Admin only
// router.get('/stats', isAdmin, async (req, res) => {
//   try {
//     const totalProjects = await Project.countDocuments();
//     const pendingProjects = await Project.countDocuments({ status: 'pending' });
//     const approvedProjects = await Project.countDocuments({ status: 'approved' });
//     const rejectedProjects = await Project.countDocuments({ status: 'rejected' });
    
//     res.json({
//       success: true,
//       data: {
//         total: totalProjects,
//         pending: pendingProjects,
//         approved: approvedProjects,
//         rejected: rejectedProjects
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// });

// module.exports = router;










const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { decrypt } = require('../utils/encryption');
const { deleteFileFromR2 } = require('../services/r2Service');
const { checkPlagiarism, compareProjects } = require('../services/plagiarismService');

// Simple admin middleware (email-based check)
// In production, you'd use proper JWT validation
const isAdmin = (req, res, next) => {
  const adminEmail = req.headers['admin-email'];
  
  if (adminEmail !== 'admin@universityhub.com') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
  
  next();
};

// @route   GET /api/admin/projects/pending
// @desc    Get all pending projects
// @access  Admin only
router.get('/projects/pending', isAdmin, async (req, res) => {
  try {
    const pendingProjects = await Project.find({ status: 'pending' })
      .sort({ createdAt: -1 });
    
    // Decrypt file URLs for admin preview
    const decryptedProjects = pendingProjects.map(project => {
      const projectObj = project.toObject();
      
      // Decrypt PDF URL
      if (projectObj.pdfUrl) {
        try {
          projectObj.pdfUrl = decrypt(projectObj.pdfUrl);
          console.log('Decrypted PDF URL:', projectObj.pdfUrl); // Debug log
        } catch (error) {
          console.error('PDF decryption error for project:', projectObj._id, error.message);
          projectObj.pdfUrl = null;
        }
      }
      
      // Decrypt Video URL
      if (projectObj.videoUrl) {
        try {
          projectObj.videoUrl = decrypt(projectObj.videoUrl);
          console.log('Decrypted Video URL:', projectObj.videoUrl); // Debug log
        } catch (error) {
          console.error('Video decryption error for project:', projectObj._id, error.message);
          projectObj.videoUrl = null;
        }
      }
      
      return projectObj;
    });
    
    res.json({
      success: true,
      count: decryptedProjects.length,
      data: decryptedProjects
    });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/projects/all
// @desc    Get all projects with optional status filter
// @access  Admin only
router.get('/projects/all', isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    // If status is provided and not 'all', filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const projects = await Project.find(query)
      .sort({ createdAt: -1 });
    
    // Decrypt file URLs for admin preview
    const decryptedProjects = projects.map(project => {
      const projectObj = project.toObject();
      
      if (projectObj.pdfUrl) {
        try {
          projectObj.pdfUrl = decrypt(projectObj.pdfUrl);
        } catch (error) {
          console.error('PDF decryption error:', error);
          projectObj.pdfUrl = null;
        }
      }
      
      if (projectObj.videoUrl) {
        try {
          projectObj.videoUrl = decrypt(projectObj.videoUrl);
        } catch (error) {
          console.error('Video decryption error:', error);
          projectObj.videoUrl = null;
        }
      }
      
      return projectObj;
    });
    
    res.json({
      success: true,
      count: decryptedProjects.length,
      data: decryptedProjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/projects/:id/approve
// @desc    Approve a project
// @access  Admin only
router.put('/projects/:id/approve', isAdmin, async (req, res) => {
  try {
    const { adminEmail } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    project.status = 'approved';
    project.approvedBy = adminEmail || 'admin@universityhub.com';
    await project.save();
    
    res.json({
      success: true,
      message: 'Project approved successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve project',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/projects/:id/reject
// @desc    Reject a project
// @access  Admin only
router.put('/projects/:id/reject', isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    project.status = 'rejected';
    project.rejectionReason = reason || 'Does not meet quality standards';
    await project.save();
    
    res.json({
      success: true,
      message: 'Project rejected',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject project',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/projects/:id
// @desc    Delete a project permanently
// @access  Admin only
router.delete('/projects/:id', isAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Delete associated files from Cloudflare R2
    if (project.pdfUrl) { try { deleteFileFromR2(decrypt(project.pdfUrl)); } catch (_) {} }
    if (project.videoUrl) { try { deleteFileFromR2(decrypt(project.videoUrl)); } catch (_) {} }
    if (project.zipUrl) { try { deleteFileFromR2(project.zipUrl); } catch (_) {} }
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin only
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const pendingProjects = await Project.countDocuments({ status: 'pending' });
    const approvedProjects = await Project.countDocuments({ status: 'approved' });
    const rejectedProjects = await Project.countDocuments({ status: 'rejected' });
    
    res.json({
      success: true,
      data: {
        total: totalProjects,
        pending: pendingProjects,
        approved: approvedProjects,
        rejected: rejectedProjects
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/projects/:id/plagiarism
// @desc    Check plagiarism for a specific project
// @access  Admin only
router.get('/projects/:id/plagiarism', isAdmin, async (req, res) => {
  try {
    console.log(`Plagiarism check requested for project: ${req.params.id}`);
    
    const result = await checkPlagiarism(req.params.id);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Plagiarism check route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check plagiarism',
      error: error.message
    });
  }
});

// @route   POST /api/admin/projects/compare
// @desc    Compare two projects for similarity
// @access  Admin only
router.post('/projects/compare', isAdmin, async (req, res) => {
  try {
    const { projectId1, projectId2 } = req.body;
    
    if (!projectId1 || !projectId2) {
      return res.status(400).json({
        success: false,
        message: 'Both project IDs are required'
      });
    }
    
    const result = await compareProjects(projectId1, projectId2);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Project comparison route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare projects',
      error: error.message
    });
  }
});

module.exports = router;




