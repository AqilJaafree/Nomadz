import React, { useState, useRef } from 'react';
import { Camera, Upload, Scale, Luggage, AlertCircle, X, RotateCcw, Wifi, WifiOff, TestTube } from 'lucide-react';
import { useEdgeImpulse } from '../hooks/useEdgeImpulse';

const LuggageEstimator = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState(null);
    const [predictionResult, setPredictionResult] = useState(null);
    const [debugMode, setDebugMode] = useState(false);
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Real Edge Impulse integration
    const { 
        isInitialized, 
        isInitializing, 
        error: eiError, 
        projectInfo,
        modelProperties,
        predictWeight,
        testWithDummyFeatures,
        reinitialize 
    } = useEdgeImpulse();

    // Camera functionality
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            setStream(mediaStream);
            setShowCamera(true);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError('Camera access denied or not available');
            console.error('Camera error:', err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target.result);
                stopCamera();
                handlePrediction(file);
            };
            reader.readAsDataURL(file);
        }, 'image/jpeg', 0.8);
    };

    // Real Edge Impulse prediction
    const handlePrediction = async (imageFile) => {
        if (!isInitialized) {
            setError('Edge Impulse model not ready. Please wait for initialization.');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            console.log('🔄 Running real Edge Impulse prediction...');
            const result = await predictWeight(imageFile);
            setPredictionResult(result);
            console.log('✅ Prediction completed:', result);
        } catch (err) {
            setError(`Prediction failed: ${err.message}`);
            console.error('❌ Prediction error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Test with dummy features
    const handleDummyTest = async () => {
        if (!isInitialized) {
            setError('Model not ready');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            console.log('🔄 Testing with dummy features...');
            const result = await testWithDummyFeatures();
            setPredictionResult({
                weight: result.results[0]?.value || 0,
                confidence: 0.5,
                anomaly: result.anomaly,
                results: result.results,
                rawResult: result,
                isDummyTest: true
            });
            console.log('✅ Dummy test completed:', result);
        } catch (err) {
            setError(`Dummy test failed: ${err.message}`);
            console.error('❌ Dummy test error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target.result);
            };
            reader.readAsDataURL(file);
            handlePrediction(file);
        } else {
            setError('Please select a valid image file');
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const fakeEvent = { target: { files: [file] } };
            handleImageUpload(fakeEvent);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const resetEstimation = () => {
        setSelectedImage(null);
        setPredictionResult(null);
        setError(null);
        stopCamera();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.titleContainer}>
                        <Luggage size={48} color="#2563eb" />
                        <h1 style={styles.title}>Nomadz</h1>
                    </div>
                    <p style={styles.subtitle}>
                        Real Edge Impulse model trained on luggage images
                    </p>
                    
                    {/* Edge Impulse Status */}
                    <div style={styles.statusContainer}>
                        {isInitializing ? (
                            <div style={{...styles.badge, backgroundColor: '#fef3c7', color: '#92400e'}}>
                                <div style={styles.smallSpinner}></div>
                                <span>Loading Edge Impulse Model...</span>
                            </div>
                        ) : isInitialized ? (
                            <div style={{...styles.badge, backgroundColor: '#dcfce7', color: '#166534'}}>
                                <Wifi size={12} />
                                <span>Model Ready: {projectInfo?.name || 'LuggageWeightEstimation'}</span>
                            </div>
                        ) : (
                            <div style={{...styles.badge, backgroundColor: '#fee2e2', color: '#dc2626'}}>
                                <WifiOff size={12} />
                                <span>Model Error</span>
                                <button 
                                    onClick={reinitialize}
                                    style={styles.retryButton}
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Model Info */}
                    {isInitialized && modelProperties && (
                        <div style={styles.modelInfo}>
                            <p style={styles.modelInfoText}>
                                Input: {modelProperties.input_width || 96}×{modelProperties.input_height || 96} • 
                                Model: {modelProperties.model_type || 'regression'}
                            </p>
                        </div>
                    )}

                    {/* Debug Toggle */}
                    {isInitialized && (
                        <div style={styles.debugToggle}>
                            <button
                                onClick={() => setDebugMode(!debugMode)}
                                style={{...styles.button, ...styles.debugButton}}
                            >
                                {debugMode ? 'Hide Debug' : 'Show Debug'}
                            </button>
                            {debugMode && (
                                <button
                                    onClick={handleDummyTest}
                                    style={{...styles.button, ...styles.testButton}}
                                    disabled={loading}
                                >
                                    <TestTube size={16} />
                                    Test Model
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {(error || eiError) && (
                    <div style={styles.errorBanner}>
                        <AlertCircle size={20} />
                        <span>{error || eiError}</span>
                    </div>
                )}

                {/* Camera View */}
                {showCamera && (
                    <div style={styles.cameraContainer}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={styles.video}
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        <div style={styles.cameraControls}>
                            <button
                                onClick={capturePhoto}
                                style={{...styles.button, ...styles.captureButton}}
                            >
                                <Camera size={20} />
                                Capture Photo
                            </button>
                            <button
                                onClick={stopCamera}
                                style={{...styles.button, ...styles.cancelButton}}
                            >
                                <X size={20} />
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {!selectedImage && !showCamera ? (
                    /* Upload Area */
                    <div>
                        <div 
                            style={styles.uploadArea}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageUpload}
                                style={styles.hiddenInput}
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" style={styles.uploadLabel}>
                                <Upload size={64} color="#9ca3af" />
                                <p style={styles.uploadText}>
                                    Click to upload or drag & drop
                                </p>
                                <p style={styles.uploadSubtext}>
                                    PNG, JPG up to 10MB
                                </p>
                            </label>
                        </div>
                        
                        <div style={styles.orDivider}>
                            <span>OR</span>
                        </div>
                        
                        <button
                            onClick={startCamera}
                            style={{...styles.button, ...styles.cameraButton}}
                            disabled={!isInitialized}
                        >
                            <Camera size={20} />
                            Use Camera
                        </button>
                    </div>
                ) : selectedImage && !showCamera ? (
                    <div style={styles.resultContainer}>
                        {/* Image Preview */}
                        <div style={styles.imageContainer}>
                            <img
                                src={selectedImage}
                                alt="Uploaded luggage"
                                style={styles.previewImage}
                            />
                            <button
                                onClick={resetEstimation}
                                style={styles.closeButton}
                                title="Remove image"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Results */}
                        <div style={styles.resultsCard}>
                            {loading ? (
                                <div style={styles.loadingContainer}>
                                    <div style={styles.spinner}></div>
                                    <p style={styles.loadingText}>Running Edge Impulse model...</p>
                                    <p style={styles.loadingSubtext}>Processing image through trained AI</p>
                                </div>
                            ) : predictionResult ? (
                                <div style={styles.predictionContainer}>
                                    <div style={styles.predictionHeader}>
                                        <Scale size={32} color="#16a34a" />
                                        <span style={styles.predictionTitle}>
                                            {predictionResult.isDummyTest ? 'Test Result' : 'Estimated Weight'}
                                        </span>
                                    </div>
                                    <div style={styles.weightDisplay}>
                                        {predictionResult.weight.toFixed(1)} kg
                                    </div>
                                    <p style={styles.accuracyText}>
                                        {predictionResult.isDummyTest ? 'Dummy test with gray image' : 'Real Edge Impulse prediction'} • 
                                        Model: {projectInfo?.name}
                                    </p>
                                    
                                    <div style={styles.metricsGrid}>
                                        <div style={styles.metricCard}>
                                            <div style={styles.metricLabel}>Confidence</div>
                                            <div style={styles.metricValue}>
                                                {(predictionResult.confidence * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                        <div style={styles.metricCard}>
                                            <div style={styles.metricLabel}>Anomaly</div>
                                            <div style={styles.metricValue}>
                                                {predictionResult.anomaly?.toFixed(3) || 'N/A'}
                                            </div>
                                        </div>
                                        <div style={styles.metricCard}>
                                            <div style={styles.metricLabel}>Status</div>
                                            <div style={styles.metricValue}>
                                                {predictionResult.isDummyTest ? '🧪' : '✅'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Debug Information */}
                                    {debugMode && predictionResult.rawResult && (
                                        <div style={styles.debugInfo}>
                                            <h4 style={styles.debugTitle}>Debug Information</h4>
                                            <div style={styles.debugContent}>
                                                <p><strong>All Results:</strong></p>
                                                {predictionResult.results.map((result, index) => (
                                                    <p key={index} style={styles.debugText}>
                                                        {result.label}: {result.value?.toFixed(4) || 'N/A'}
                                                    </p>
                                                ))}
                                                <p><strong>Raw Output:</strong></p>
                                                <pre style={styles.debugJson}>
                                                    {JSON.stringify(predictionResult.rawResult, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>

                        {/* Action Buttons */}
                        <div style={styles.actionButtons}>
                            <button
                                onClick={resetEstimation}
                                style={{...styles.button, ...styles.secondaryButton}}
                            >
                                Try Another Photo
                            </button>
                            <button
                                onClick={() => {
                                    const fileInput = fileInputRef.current;
                                    if (fileInput && fileInput.files[0]) {
                                        handlePrediction(fileInput.files[0]);
                                    }
                                }}
                                disabled={loading || !isInitialized}
                                style={{
                                    ...styles.button, 
                                    ...styles.primaryButton,
                                    opacity: (loading || !isInitialized) ? 0.5 : 1
                                }}
                            >
                                <RotateCcw size={16} />
                                {loading ? 'Analyzing...' : 'Re-analyze'}
                            </button>
                        </div>
                    </div>
                ) : null}

                {/* Features */}
                <div style={styles.featuresGrid}>
                    <div style={{...styles.featureCard, backgroundColor: '#dbeafe'}}>
                        <Luggage size={32} color="#2563eb" />
                        <h3 style={styles.featureTitle}>Real AI Model</h3>
                        <p style={styles.featureText}>Your trained Edge Impulse model</p>
                    </div>
                    <div style={{...styles.featureCard, backgroundColor: '#dcfce7'}}>
                        <Scale size={32} color="#16a34a" />
                        <h3 style={styles.featureTitle}>Fast Inference</h3>
                        <p style={styles.featureText}>WebAssembly performance</p>
                    </div>
                    <div style={{...styles.featureCard, backgroundColor: '#f3e8ff'}}>
                        <Camera size={32} color="#9333ea" />
                        <h3 style={styles.featureTitle}>Camera Ready</h3>
                        <p style={styles.featureText}>Mobile camera integration</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced styles
const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    card: {
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '32px',
        position: 'relative'
    },
    header: { textAlign: 'center', marginBottom: '32px' },
    titleContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', gap: '12px' },
    title: { fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 },
    subtitle: { color: '#6b7280', fontSize: '1.1rem', margin: '8px 0 16px 0' },
    statusContainer: { display: 'flex', justifyContent: 'center', marginBottom: '16px' },
    badge: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '20px', fontSize: '0.875rem', border: '1px solid currentColor' },
    smallSpinner: { width: '12px', height: '12px', border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    retryButton: { marginLeft: '8px', padding: '2px 8px', backgroundColor: 'transparent', border: '1px solid currentColor', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' },
    modelInfo: { marginBottom: '16px' },
    modelInfoText: { fontSize: '0.875rem', color: '#6b7280', margin: 0 },
    debugToggle: { display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' },
    debugButton: { padding: '6px 12px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer' },
    testButton: { padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer' },
    errorBanner: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fecaca' },
    uploadArea: { border: '2px dashed #d1d5db', borderRadius: '12px', padding: '48px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', marginBottom: '24px' },
    uploadLabel: { cursor: 'pointer', display: 'block' },
    uploadText: { fontSize: '1.25rem', color: '#4b5563', margin: '16px 0 8px 0' },
    uploadSubtext: { fontSize: '0.875rem', color: '#9ca3af', margin: '0' },
    hiddenInput: { display: 'none' },
    orDivider: { textAlign: 'center', margin: '24px 0', position: 'relative', color: '#9ca3af', fontSize: '0.875rem' },
    button: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', textDecoration: 'none' },
    cameraButton: { backgroundColor: '#16a34a', color: 'white', width: '100%', justifyContent: 'center' },
    primaryButton: { backgroundColor: '#2563eb', color: 'white' },
    secondaryButton: { backgroundColor: '#e5e7eb', color: '#374151' },
    captureButton: { backgroundColor: '#16a34a', color: 'white' },
    cancelButton: { backgroundColor: '#ef4444', color: 'white' },
    cameraContainer: { position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' },
    video: { width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover' },
    cameraControls: { position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px' },
    resultContainer: { display: 'flex', flexDirection: 'column', gap: '24px' },
    imageContainer: { position: 'relative', borderRadius: '12px', overflow: 'hidden' },
    previewImage: { width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px' },
    closeButton: { position: 'absolute', top: '12px', right: '12px', backgroundColor: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' },
    resultsCard: { backgroundColor: '#f9fafb', borderRadius: '12px', padding: '24px' },
    loadingContainer: { textAlign: 'center' },
    spinner: { width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' },
    loadingText: { color: '#4b5563', margin: '0 0 8px 0' },
    loadingSubtext: { color: '#9ca3af', fontSize: '0.875rem', margin: '0' },
    predictionContainer: { textAlign: 'center' },
    predictionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' },
    predictionTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' },
    weightDisplay: { fontSize: '4rem', fontWeight: 'bold', color: '#2563eb', margin: '8px 0' },
    accuracyText: { color: '#6b7280', fontSize: '0.875rem', margin: '0 0 24px 0' },
    metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' },
    metricCard: { backgroundColor: 'white', borderRadius: '8px', padding: '16px', textAlign: 'center' },
    metricLabel: { fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '4px' },
    metricValue: { fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' },
    debugInfo: { marginTop: '16px', textAlign: 'left', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px' },
    debugTitle: { fontSize: '1rem', fontWeight: '600', color: '#1f2937', margin: '0 0 12px 0' },
    debugContent: { fontSize: '0.875rem' },
    debugText: { margin: '4px 0', color: '#4b5563' },
    debugJson: { fontSize: '0.75rem', backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '4px', overflow: 'auto', maxHeight: '200px', margin: '8px 0 0 0' },
    actionButtons: { display: 'flex', gap: '16px' },
    featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '32px' },
    featureCard: { padding: '24px', borderRadius: '12px', textAlign: 'center' },
    featureTitle: { fontWeight: '600', color: '#1f2937', margin: '12px 0 8px 0' },
    featureText: { fontSize: '0.875rem', color: '#6b7280', margin: '0' }
};

// Add CSS animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .upload-area:hover {
    border-color: #3b82f6 !important;
    background-color: #f8fafc;
  }
  
  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  button:disabled:hover {
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    .action-buttons {
      flex-direction: column;
    }
    
    .features-grid {
      grid-template-columns: 1fr;
    }
    
    .metrics-grid {
      grid-template-columns: 1fr;
    }
  }
`;
document.head.appendChild(styleSheet);

export default LuggageEstimator;