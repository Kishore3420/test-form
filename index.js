'use strict';
// Resume parsing and auto-fill functionality
const resumeFile = document.getElementById('resumeFile');
const extractedInfo = document.getElementById('extractedInfo');
const infoDisplay = document.getElementById('infoDisplay');

// Simple regex patterns for extraction
const patterns = {
	name: /^(([A-Z][a-z]+ ){1,3}[A-Z][a-z]+)$/,
	email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
	phone: /(\+\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/,
	education: /(?:Bachelor|Master|PhD|Degree|University|College).*$/im,
	workExperience: /(?:Work Experience|Professional Experience|Employment).*$/im,
	skills: /(?:Skills|Technical Skills|Competencies).*$/im,
};

resumeFile.addEventListener('change', async (e) => {
	const file = e.target.files[0];
	if (!file) return;

	try {
		let text = '';

		// Handle PDF files
		if (file.type === 'application/pdf') {
			text = await extractPDFText(file);
		}
		// Handle Word documents
		else if (
			file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
			file.type === 'application/msword'
		) {
			text = await extractWordText(file);
		}

		// Extract information
		const extractedData = extractResumeInfo(text);

		// Display extracted info
		infoDisplay.textContent = JSON.stringify(extractedData, null, 2);
		extractedInfo.style.display = 'block';

		// Auto-fill form
		autoFillForm(extractedData);
	} catch (error) {
		console.error('Error processing resume:', error);
		alert('Error processing resume. Please try again.');
	}
});

// PDF text extraction using PDF.js
async function extractPDFText(file) {
	const arrayBuffer = await file.arrayBuffer();
	const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
	let text = '';

	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const textContent = await page.getTextContent();
		text += textContent.items.map((item) => item.str).join(' ');
	}

	return text;
}

// Word document text extraction using Mammoth
async function extractWordText(file) {
	const arrayBuffer = await file.arrayBuffer();
	const result = await mammoth.extractRawText({ arrayBuffer });
	return result.value;
}

// Extract key information from resume text
function extractResumeInfo(text) {
	const extractedData = {};

	// Extract name (first matching pattern)
	const nameMatch = text.match(patterns.name);
	extractedData.name = nameMatch ? nameMatch[0] : '';

	// Extract email
	const emailMatch = text.match(patterns.email);
	extractedData.email = emailMatch ? emailMatch[0] : '';

	// Extract phone number
	const phoneMatch = text.match(patterns.phone);
	extractedData.phone = phoneMatch ? phoneMatch[0] : '';

	// Extract education sections
	const educationMatch = text.match(patterns.education);
	extractedData.education = educationMatch ? educationMatch[0] : '';

	// Extract work experience sections
	const workMatch = text.match(patterns.workExperience);
	extractedData.workExperience = workMatch ? workMatch[0] : '';

	// Extract skills sections
	const skillsMatch = text.match(patterns.skills);
	extractedData.skills = skillsMatch ? skillsMatch[0] : '';

	return extractedData;
}

// Auto-fill form with extracted data
function autoFillForm(data) {
	// Map extracted data to form fields
	document.getElementById('fullName').value = data.name || '';
	document.getElementById('email').value = data.email || '';
	document.getElementById('phone').value = data.phone || '';
	document.getElementById('education').value = data.education || '';
	document.getElementById('workExperience').value = data.workExperience || '';
	document.getElementById('skills').value = data.skills || '';
}

// Form submission handler
document.getElementById('jobApplicationForm').addEventListener('submit', (e) => {
	e.preventDefault();

	// Collect form data
	const formData = new FormData(e.target);
	const applicationData = Object.fromEntries(formData.entries());

	// In a real-world scenario, you would send this data to a server
	console.log('Submitted Application Data:', applicationData);
	alert('Application submitted successfully!');
});
