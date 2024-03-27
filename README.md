# Voicelink 📞

Voicelink is a lightweight web application built with Node.js and Twilio for making and receiving encrypted voice calls over the internet. With Voicelink, you can communicate securely without compromising your privacy.

![GitHub](https://img.shields.io/github/license/d10xi24/voicelink)
![GitHub repo size](https://img.shields.io/github/repo-size/d10xi24/voicelink)
![GitHub issues](https://img.shields.io/github/issues/d10xi24/voicelink)
![GitHub pull requests](https://img.shields.io/github/issues-pr/d10xi24/voicelink)

## Language and Dependencies

![JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow)
![CSS](https://img.shields.io/badge/Styles-CSS-blue)
![HTML](https://img.shields.io/badge/Markup-HTML-orange)
![Node.js](https://img.shields.io/badge/Node.js-v14.17.0-green)

### JavaScript Libraries

- ![Twilio](https://img.shields.io/badge/Twilio-v4.0.0-blueviolet): Twilio's JavaScript SDK for voice calling functionality.
- ![Express](https://img.shields.io/badge/Express-v4.17.1-green): Web framework for Node.js, used for handling HTTP requests and routing.
- ![Winston](https://img.shields.io/badge/Winston-v3.3.3-yellowgreen): Logging library for Node.js, used for error tracking and debugging.
- ![jQuery](https://img.shields.io/badge/jQuery-v3.6.0-blue): JavaScript library for DOM manipulation and event handling.
- ![intlTelInput](https://img.shields.io/badge/intlTelInput-v17.0.12-orange): jQuery plugin for international telephone input.


### CSS Frameworks

- **Bootstrap**: Front-end framework for styling and layout.
- **FontAwesome**: Icon library for adding icons to the user interface.

### HTML Templating

- **EJS**: Embedded JavaScript templates for generating HTML markup with JavaScript.

## Features

- **Secure Communication**: Utilizes Twilio's encrypted voice calling technology for secure communication.
- **Token-Based Authentication**: Generates JWT access tokens for authentication and authorization.
- **Dynamic Identity Generation**: Generates unique and dynamic identities for each user session.
- **Flexible Configuration**: Easily configurable with environment variables for API keys and other settings.
- **Logging and Monitoring**: Integrated logging with Winston for error tracking and debugging.

## Getting Started

1. Clone the repository: `git clone https://github.com/d10xi24/voicelink.git`
2. Install dependencies: `npm install`
3. Set up environment variables: Create a `.env` file based on `.env.example` and add your Twilio API keys.
4. Start the server: `npm start`
5. Access the application in your web browser: `http://localhost:1337`

## Usage

1. Navigate to the application URL.
2. Enter the phone number you want to call.
3. Click the "Call" button to initiate the call.
4. Accept incoming calls by clicking the "Answer" button.
5. End the call by clicking the "Hang Up" button.

## Contributing

Contributions are welcome! Please feel free to fork the repository, make changes, and submit a pull request. For major changes, please open an issue first to discuss the proposed changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Twilio](https://www.twilio.com/) for providing the voice calling infrastructure.
- [Express](https://expressjs.com/) for the web framework.
- [Winston](https://github.com/winstonjs/winston) for the logging library.
- [jQuery](https://jquery.com/) for DOM manipulation and event handling.
- [intlTelInput](https://github.com/jackocnr/intl-tel-input) for international telephone input.

## Author

[dion@levatine](https://github.com/d10xi24)
