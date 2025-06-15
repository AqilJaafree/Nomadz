# Nomadz 🧳✈️

**AI-Powered Luggage Weight Estimator for Smart Travel**

Nomadz is an intelligent web application that uses computer vision and machine learning to estimate luggage weight from photos. Built with React and powered by Edge Impulse, it helps travelers avoid airport overweight fees and plan their packing efficiently.

![Nomadz Demo](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-18.0+-blue) ![Edge Impulse](https://img.shields.io/badge/Edge%20Impulse-WebAssembly-orange) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🤖 **Real AI Model**
- Custom-trained Edge Impulse model for luggage weight prediction
- Computer vision-based weight estimation from photos
- Real-time inference with WebAssembly (3ms prediction time)
- 96x96 image processing optimized for mobile devices

### 📱 **User-Friendly Interface**
- **Camera Integration**: Take photos directly with your phone camera
- **Drag & Drop Upload**: Easy image upload from gallery
- **Instant Results**: Get weight predictions in seconds
- **Mobile Optimized**: Responsive design for travel use

### 🔧 **Developer Features**
- **Debug Mode**: View raw model outputs and confidence scores
- **Test Functions**: Validate model performance with dummy data
- **Error Recovery**: Robust error handling and retry mechanisms
- **Real-time Status**: Live model initialization feedback

### 🌟 **Travel-Ready**
- **Offline Capable**: Works without internet after initial load
- **Fast Loading**: Lightweight WebAssembly model (~50KB)
- **Cross-Platform**: Works on any device with a web browser
- **Privacy First**: All processing happens locally on your device

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- NPM or Yarn package manager
- Modern web browser with WebAssembly support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nomadz.git
   cd nomadz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your Edge Impulse model**
   
   Download your trained model from Edge Impulse:
   - Go to your Edge Impulse project
   - Navigate to **Deployment** → **WebAssembly**
   - Click **Build** and download the ZIP file
   - Extract and copy these files to `public/`:
     ```
     public/
     ├── edge-impulse-standalone.js
     ├── edge-impulse-standalone.wasm
     └── vite.svg
     ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` and start estimating luggage weights!

## 🏗️ Project Structure

```
nomadz/
├── public/
│   ├── edge-impulse-standalone.js    # Your trained AI model
│   ├── edge-impulse-standalone.wasm  # WebAssembly binary
│   └── vite.svg
├── src/
│   ├── hooks/
│   │   └── useEdgeImpulse.js         # Edge Impulse integration
│   ├── components/
│   │   └── LuggageEstimator.jsx      # Main component
│   ├── App.jsx                       # App container
│   ├── main.jsx                      # React entry point
│   └── index.css                     # Global styles
├── package.json
└── README.md
```

## 🧪 How It Works

### 1. **Image Processing Pipeline**
```
User Photo → Resize to 96x96 → RGB Extraction → Feature Array (27,648 values)
```

### 2. **AI Inference**
```
Features → Edge Impulse Model → Weight Prediction + Confidence Score
```

### 3. **Result Display**
```
Raw Prediction → UI Formatting → User-Friendly Display
```

### Technical Flow
1. **Image Capture**: Camera or file upload
2. **Preprocessing**: Resize and normalize to model input format
3. **Feature Extraction**: Convert RGB pixels to numerical array
4. **AI Prediction**: Run through trained neural network
5. **Post-processing**: Format results for display

## 🎯 Usage Guide

### Basic Usage

1. **Launch the app** and wait for the green "Model Ready" status
2. **Take a photo** of your luggage or upload from gallery
3. **Wait for prediction** (usually 1-3 seconds)
4. **View results** including weight estimate and confidence

### Debug Mode

Enable debug mode to:
- **Test the model** with dummy data
- **View raw outputs** from the AI model
- **Check confidence scores** and anomaly detection
- **Verify model performance**

### Tips for Best Results

- **Good lighting**: Ensure luggage is well-lit
- **Clear background**: Minimal background clutter
- **Full luggage view**: Include the entire luggage in frame
- **Stable shot**: Avoid blurry or tilted photos

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Key Dependencies

```json
{
  "react": "^18.0.0",
  "lucide-react": "^0.263.1",
  "vite": "^4.0.0"
}
```

### Environment Setup

**Development:**
- Uses Vite for fast development and HMR
- WebAssembly files served from `public/` directory
- React Strict Mode enabled for development

**Production:**
- Optimized WebAssembly loading
- Code splitting and lazy loading
- Progressive Web App ready

## 🤖 Edge Impulse Integration

### Model Requirements
- **Input**: 96x96 RGB images (27,648 features)
- **Output**: Single regression value (weight in kg)
- **Format**: WebAssembly deployment from Edge Impulse

### Training Your Own Model

1. **Collect Data**: Photos of luggage with known weights
2. **Edge Impulse Setup**: Create project and upload dataset
3. **Model Training**: Use transfer learning or custom architecture
4. **Deployment**: Export as WebAssembly for browser use
5. **Integration**: Replace model files in `public/` folder

### Model Performance
- **Inference Time**: ~3ms on modern devices
- **Model Size**: ~50KB (highly optimized)
- **Accuracy**: Depends on training data quality
- **Supported Formats**: JPG, PNG, WebP

## 📱 Mobile Optimization

### Camera Features
- **Environment Facing**: Prefers rear camera for better quality
- **Auto-capture**: Easy one-tap photo capture
- **Gallery Upload**: Alternative to camera capture

### Performance
- **Responsive Design**: Works on all screen sizes
- **Touch Optimized**: Large buttons and gesture support
- **Fast Loading**: Optimized for mobile networks
- **Offline Support**: Works without internet after initial load

## 🛠️ Troubleshooting

### Common Issues

**"Model Error" Badge**
```bash
# Check files exist
ls -la public/edge-impulse-*

# Verify file access
curl http://localhost:5173/edge-impulse-standalone.js
```

**WebAssembly Errors**
- Re-download model from Edge Impulse
- Ensure you selected "WebAssembly (Browser)" not Node.js
- Clear browser cache and restart dev server

**Camera Not Working**
- Check browser permissions for camera access
- Ensure HTTPS in production (camera requires secure context)
- Try using file upload as alternative

**Slow Predictions**
- Check console for errors
- Verify model files are loading correctly
- Test with debug mode first

### Debug Steps

1. **Check Model Status**: Look for green "Model Ready" badge
2. **Test Model**: Use debug mode "Test Model" button
3. **Console Logs**: Check browser developer console
4. **Network Tab**: Verify WebAssembly files load correctly

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Manual Deployment
```bash
npm run build
# Deploy dist/ folder to any static hosting
```

### Important Notes
- Ensure WebAssembly files are served with correct MIME types
- HTTPS required for camera functionality in production
- Consider CDN for faster global loading

## 🤝 Contributing

We welcome contributions to Nomadz! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow React best practices
- Use TypeScript for new features (optional)
- Add tests for new functionality
- Update documentation for API changes
- Ensure mobile compatibility

### Bug Reports
Use GitHub Issues with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and device information
- Console error messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Nomadz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **Edge Impulse** for providing the machine learning platform
- **React Team** for the excellent framework
- **Vite** for fast development experience
- **Lucide React** for beautiful icons
- **TensorFlow Lite** for efficient on-device inference

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: [support@nomadz.app](mailto:support@nomadz.app)

## 🗺️ Roadmap

### Version 2.0
- [ ] Multi-luggage detection and total weight calculation
- [ ] Luggage dimension estimation (length, width, height)
- [ ] Travel recommendations based on airline weight limits
- [ ] Historical tracking and packing insights

### Future Features
- [ ] Integration with airline APIs for real-time weight limits
- [ ] Barcode scanning for luggage identification
- [ ] Cloud sync for travel history
- [ ] Progressive Web App with offline capabilities
- [ ] Multiple language support

---

**Made with ❤️ for travelers worldwide**

*Safe travels with Nomadz! 🌍✈️*