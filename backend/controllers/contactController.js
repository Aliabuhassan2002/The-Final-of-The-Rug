const Contact = require("../models/Contact");
const { validationResult } = require("express-validator");

exports.submitContactForm = async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, message, phone, address } = req.body;

  try {
    // Create new contact entry
    const contact = await Contact.create({
      name,
      email,
      message,
      phone: phone || undefined, // Optional field
      address: address || undefined, // Optional field
    });

    res.status(201).json({
      success: true,
      data: contact,
      message: "Thank you for your message! We will get back to you soon.",
    });
  } catch (err) {
    console.error("Error submitting contact form:", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit contact form. Please try again later.",
    });
  }
};

exports.getContactSubmissions = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (err) {
    console.error("Error fetching contact submissions:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact submissions",
    });
  }
};
