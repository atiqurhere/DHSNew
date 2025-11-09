const PageContent = require('../models/PageContent');

// @desc    Get page content by type
// @route   GET /api/pages/:pageType
// @access  Public
exports.getPageContent = async (req, res) => {
  try {
    const { pageType } = req.params;
    
    let page = await PageContent.findOne({ pageType });
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Sort sections by order
    page.sections.sort((a, b) => a.order - b.order);
    
    // Filter visible sections for public view
    const visibleSections = page.sections.filter(section => section.isVisible);

    res.json({
      pageType: page.pageType,
      sections: visibleSections,
      updatedAt: page.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all page content (admin)
// @route   GET /api/pages/admin/all
// @access  Private/Admin
exports.getAllPageContent = async (req, res) => {
  try {
    const pages = await PageContent.find().populate('updatedBy', 'name email');
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update page content
// @route   PUT /api/pages/:pageType
// @access  Private/Admin
exports.updatePageContent = async (req, res) => {
  try {
    const { pageType } = req.params;
    const { sections } = req.body;

    let page = await PageContent.findOne({ pageType });

    if (!page) {
      // Create new page if doesn't exist
      page = await PageContent.create({
        pageType,
        sections,
        updatedBy: req.user._id
      });
    } else {
      page.sections = sections;
      page.updatedBy = req.user._id;
      page.updatedAt = Date.now();
      await page.save();
    }

    res.json({
      message: 'Page content updated successfully',
      page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add section to page
// @route   POST /api/pages/:pageType/sections
// @access  Private/Admin
exports.addSection = async (req, res) => {
  try {
    const { pageType } = req.params;
    const sectionData = req.body;

    const page = await PageContent.findOne({ pageType });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    page.sections.push(sectionData);
    page.updatedBy = req.user._id;
    page.updatedAt = Date.now();
    await page.save();

    res.json({
      message: 'Section added successfully',
      page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update section
// @route   PUT /api/pages/:pageType/sections/:sectionId
// @access  Private/Admin
exports.updateSection = async (req, res) => {
  try {
    const { pageType, sectionId } = req.params;
    const sectionData = req.body;

    const page = await PageContent.findOne({ pageType });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    const section = page.sections.id(sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    Object.assign(section, sectionData);
    page.updatedBy = req.user._id;
    page.updatedAt = Date.now();
    await page.save();

    res.json({
      message: 'Section updated successfully',
      page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete section
// @route   DELETE /api/pages/:pageType/sections/:sectionId
// @access  Private/Admin
exports.deleteSection = async (req, res) => {
  try {
    const { pageType, sectionId } = req.params;

    const page = await PageContent.findOne({ pageType });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    page.sections.pull(sectionId);
    page.updatedBy = req.user._id;
    page.updatedAt = Date.now();
    await page.save();

    res.json({
      message: 'Section deleted successfully',
      page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
