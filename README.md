# CDM Tower of Prayer - Youth Intake Form

A modern, dynamic youth registration form with metallic design theme using blue, grey, and white colors.

## Features

- **Dynamic Form Generation**: Automatically generates form fields from JSON configuration
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Metallic theme with smooth animations and transitions
- **Form Validation**: Real-time validation with error highlighting
- **Conditional Fields**: Fields that show/hide based on other selections
- **Formspree Integration**: Secure form submission handling

## Setup Instructions

### 1. Formspree Configuration

To enable form submissions, you need to set up a Formspree account:

1. Go to [Formspree.io](https://formspree.io) and create a free account
2. Create a new form and get your form endpoint URL
3. Update the `formspreeEndpoint` in `scripts/script.js`:

```javascript
// Replace YOUR_FORM_ID with your actual Formspree form ID
this.formspreeEndpoint = 'https://formspree.io/f/YOUR_FORM_ID';
```

### 2. Customizing the Form

To add or modify form fields, edit the `json/cdmyouthform.json` file:

```json
{
  "formTitle": "Your Form Title",
  "formDescription": "Your form description",
  "sections": [
    {
      "title": "Section Name",
      "fields": [
        {
          "id": "fieldId",
          "label": "Field Label",
          "type": "text|email|tel|date|select|radio|checkbox|textarea",
          "required": true|false,
          "placeholder": "Placeholder text",
          "options": [ // For select, radio, checkbox fields
            {"value": "option1", "label": "Option 1"},
            {"value": "option2", "label": "Option 2"}
          ],
          "dependsOn": { // Optional: for conditional fields
            "id": "parentFieldId",
            "value": "triggerValue"
          }
        }
      ]
    }
  ]
}
```

### 3. Field Types Supported

- **text**: Regular text input
- **email**: Email input with validation
- **tel**: Phone number input with validation
- **date**: Date picker
- **textarea**: Multi-line text input
- **select**: Dropdown selection
- **radio**: Single choice from multiple options
- **checkbox**: Multiple selections allowed

### 4. Conditional Fields

Fields can be shown/hidden based on other field values:

```json
{
  "id": "baptismDate",
  "label": "Baptism Date",
  "type": "date",
  "dependsOn": {
    "id": "baptized",
    "value": "yes"
  }
}
```

This field will only show when the "baptized" field is set to "yes".

## File Structure

```
├── index.html          # Main HTML file
├── styles/
│   └── style.css       # CSS styles with metallic theme
├── scripts/
│   └── script.js       # Dynamic form generation and Formspree integration
├── json/
│   └── cdmyouthform.json # Form configuration
└── README.md           # This file
```

## Deployment

1. Upload all files to your web server
2. Ensure the Formspree endpoint is correctly configured
3. Test the form submission to verify everything works

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

© 2025 CDM Tower of Prayer. All rights reserved.
