// src/hooks/useEdgeImpulse.js - React Safe Version
import { useState, useEffect, useRef } from 'react';

// Global flag to prevent multiple initializations
let globalModuleState = {
    isInitializing: false,
    isInitialized: false,
    module: null,
    error: null,
    callbacks: []
};

const addCallback = (callback) => {
    globalModuleState.callbacks.push(callback);
};

const triggerCallbacks = (error = null) => {
    globalModuleState.callbacks.forEach(callback => callback(error));
    globalModuleState.callbacks = [];
};

export const useEdgeImpulse = () => {
    const [isInitialized, setIsInitialized] = useState(globalModuleState.isInitialized);
    const [isInitializing, setIsInitializing] = useState(globalModuleState.isInitializing);
    const [error, setError] = useState(globalModuleState.error);
    const [projectInfo, setProjectInfo] = useState(null);
    const [modelProperties] = useState({
        input_width: 96,
        input_height: 96,
        model_type: 'regression'
    });
    const mountedRef = useRef(true);

    useEffect(() => {
        const initialize = async () => {
            // If already initialized, update state and return
            if (globalModuleState.isInitialized) {
                setIsInitialized(true);
                setIsInitializing(false);
                setError(null);
                
                // Get project info if not set
                if (!projectInfo && globalModuleState.module) {
                    try {
                        const project = globalModuleState.module.get_project();
                        setProjectInfo({
                            name: project.name || 'LuggageWeightEstimation',
                            owner: project.owner || 'Unknown',
                            version: project.deploy_version || 'v2'
                        });
                    } catch (e) {
                        setProjectInfo({ name: 'LuggageWeightEstimation', owner: 'Unknown', version: 'v2' });
                    }
                }
                return;
            }

            // If currently initializing, wait for completion
            if (globalModuleState.isInitializing) {
                setIsInitializing(true);
                addCallback((error) => {
                    if (!mountedRef.current) return;
                    
                    if (error) {
                        setError(error);
                        setIsInitializing(false);
                    } else {
                        setIsInitialized(true);
                        setIsInitializing(false);
                        setError(null);
                        
                        // Set project info
                        try {
                            const project = globalModuleState.module.get_project();
                            setProjectInfo({
                                name: project.name || 'LuggageWeightEstimation',
                                owner: project.owner || 'Unknown',
                                version: project.deploy_version || 'v2'
                            });
                        } catch (e) {
                            setProjectInfo({ name: 'LuggageWeightEstimation', owner: 'Unknown', version: 'v2' });
                        }
                    }
                });
                return;
            }

            // Start initialization
            globalModuleState.isInitializing = true;
            setIsInitializing(true);
            setError(null);

            try {
                console.log('🔄 Initializing Edge Impulse (Global)...');

                // Clean up any existing modules completely
                if (window.Module) {
                    delete window.Module;
                }

                // Remove any existing script tags
                const existingScripts = document.querySelectorAll('script[src="/edge-impulse-standalone.js"]');
                existingScripts.forEach(script => script.remove());

                // Wait a bit for cleanup
                await new Promise(resolve => setTimeout(resolve, 100));

                // Initialize with the exact configuration that worked in HTML test
                await new Promise((resolve, reject) => {
                    let resolved = false;

                    // Create minimal Module configuration (same as working test)
                    window.Module = {
                        onRuntimeInitialized: function() {
                            if (resolved) return;
                            resolved = true;
                            
                            try {
                                console.log('✅ Runtime initialized (Global)');
                                this.init();
                                console.log('✅ Module.init() successful (Global)');
                                
                                // Store the module globally
                                globalModuleState.module = this;
                                resolve();
                            } catch (error) {
                                reject(new Error(`Module.init() failed: ${error.message}`));
                            }
                        },
                        onAbort: function(what) {
                            if (!resolved) {
                                resolved = true;
                                reject(new Error(`Module aborted: ${what}`));
                            }
                        },
                        print: function(text) {
                            console.log('📄 Module:', text);
                        },
                        printErr: function(text) {
                            // Ignore TensorFlow info messages
                            if (text.includes('INFO:') || text.includes('TensorFlow')) {
                                console.log('📄 Module info:', text);
                            } else {
                                console.error('❌ Module error:', text);
                            }
                        }
                    };

                    // Load script
                    const script = document.createElement('script');
                    script.src = '/edge-impulse-standalone.js';
                    script.onload = () => {
                        console.log('✅ Script loaded (Global)');
                    };
                    script.onerror = () => {
                        if (!resolved) {
                            resolved = true;
                            reject(new Error('Failed to load script'));
                        }
                    };
                    document.head.appendChild(script);

                    // Timeout protection
                    setTimeout(() => {
                        if (!resolved) {
                            resolved = true;
                            reject(new Error('Initialization timeout'));
                        }
                    }, 10000);
                });

                // Test the module
                console.log('🔄 Testing module (Global)...');
                const testFeatures = new Array(96 * 96 * 3).fill(128);
                const testResult = classifyWithModule(globalModuleState.module, testFeatures);
                console.log('✅ Module test successful (Global):', testResult);

                // Get project info
                let info;
                try {
                    const project = globalModuleState.module.get_project();
                    info = {
                        name: project.name || 'LuggageWeightEstimation',
                        owner: project.owner || 'Unknown',
                        version: project.deploy_version || 'v2'
                    };
                } catch (e) {
                    info = { name: 'LuggageWeightEstimation', owner: 'Unknown', version: 'v2' };
                }

                // Update global state
                globalModuleState.isInitialized = true;
                globalModuleState.isInitializing = false;
                globalModuleState.error = null;

                // Update component state
                if (mountedRef.current) {
                    setIsInitialized(true);
                    setIsInitializing(false);
                    setError(null);
                    setProjectInfo(info);
                }

                console.log('✅ Edge Impulse ready (Global):', info);
                triggerCallbacks(null);

            } catch (err) {
                const errorMessage = `Failed to initialize Edge Impulse: ${err.message}`;
                console.error('❌', errorMessage);

                globalModuleState.isInitializing = false;
                globalModuleState.error = errorMessage;

                if (mountedRef.current) {
                    setError(errorMessage);
                    setIsInitializing(false);
                }

                triggerCallbacks(errorMessage);
            }
        };

        initialize();

        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Classification function (same as working test)
    const classifyWithModule = (module, features) => {
        try {
            const typedArray = new Float32Array(features);
            const numBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT;
            const ptr = module._malloc(numBytes);
            const heapBytes = new Uint8Array(module.HEAPU8.buffer, ptr, numBytes);
            heapBytes.set(new Uint8Array(typedArray.buffer));

            const result = module.run_classifier(heapBytes.byteOffset, features.length, false);
            module._free(ptr);
            
            if (result.result !== 0) {
                throw new Error(`Classification failed with code: ${result.result}`);
            }

            const jsResult = {
                anomaly: result.anomaly || 0,
                results: []
            };

            for (let cx = 0; cx < result.size(); cx++) {
                let c = result.get(cx);
                jsResult.results.push({ 
                    label: c.label || 'value', 
                    value: c.value || 0
                });
                c.delete();
            }

            result.delete();
            return jsResult;

        } catch (error) {
            throw new Error(`Classification failed: ${error.message}`);
        }
    };

    const processImageToFeatures = async (imageFile) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 96;
                    canvas.height = 96;
                    
                    ctx.drawImage(img, 0, 0, 96, 96);
                    
                    const imageData = ctx.getImageData(0, 0, 96, 96);
                    const pixels = imageData.data;
                    
                    const features = [];
                    for (let i = 0; i < pixels.length; i += 4) {
                        features.push(pixels[i]);
                        features.push(pixels[i + 1]);
                        features.push(pixels[i + 2]);
                    }
                    
                    resolve(features);
                } catch (err) {
                    reject(new Error(`Image processing failed: ${err.message}`));
                }
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(imageFile);
        });
    };

    const predictWeight = async (imageFile) => {
        if (!globalModuleState.isInitialized || !globalModuleState.module) {
            throw new Error('Edge Impulse model not ready');
        }

        try {
            console.log('🔄 Starting weight prediction...');
            
            const features = await processImageToFeatures(imageFile);
            const result = classifyWithModule(globalModuleState.module, features);
            
            console.log('✅ Prediction result:', result);
            
            const predictedWeight = result.results[0]?.value || 0;
            
            return {
                weight: predictedWeight,
                confidence: Math.min(Math.abs(predictedWeight) / 10, 1),
                anomaly: result.anomaly,
                results: result.results,
                rawResult: result
            };
        } catch (err) {
            throw new Error(`Prediction failed: ${err.message}`);
        }
    };

    const testWithDummyFeatures = async () => {
        if (!globalModuleState.isInitialized || !globalModuleState.module) {
            throw new Error('Model not ready');
        }

        try {
            const dummyFeatures = new Array(96 * 96 * 3).fill(128);
            const result = classifyWithModule(globalModuleState.module, dummyFeatures);
            
            console.log('✅ Dummy test result:', result);
            return result;
        } catch (err) {
            throw new Error(`Test failed: ${err.message}`);
        }
    };

    const reinitialize = () => {
        // Reset global state
        globalModuleState.isInitializing = false;
        globalModuleState.isInitialized = false;
        globalModuleState.module = null;
        globalModuleState.error = null;
        globalModuleState.callbacks = [];

        // Clean up
        if (window.Module) {
            delete window.Module;
        }

        // Reload page
        window.location.reload();
    };

    return {
        isInitialized,
        isInitializing,
        error,
        projectInfo,
        modelProperties,
        predictWeight,
        testWithDummyFeatures,
        reinitialize
    };
};