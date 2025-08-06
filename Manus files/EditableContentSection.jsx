import { useState, useEffect } from 'react';
import { ArrowRight, Zap, Shield, Brain, Network } from 'lucide-react';
import SimpleEditableText from './SimpleEditableText';

const EditableContentSection = () => {
  // State for editable content
  const [content, setContent] = useState({
    sectionTitle: 'SYSTEM CAPABILITIES',
    sectionDescription: 'Experience the next generation of AI-powered interface technology with advanced features designed for optimal performance and seamless integration.',
    features: [
      {
        icon: Brain,
        title: "Advanced AI Processing",
        description: "State-of-the-art artificial intelligence with quantum processing capabilities for real-time decision making."
      },
      {
        icon: Shield,
        title: "Enhanced Security Protocols",
        description: "Military-grade encryption and multi-layered security systems to protect sensitive data and operations."
      },
      {
        icon: Network,
        title: "Global Network Integration",
        description: "Seamless connectivity across all platforms and devices with instantaneous data synchronization."
      },
      {
        icon: Zap,
        title: "Reactive Response System",
        description: "Lightning-fast response times with predictive analysis and automated threat assessment."
      }
    ],
    techSpecs: {
      title: 'TECHNICAL SPECIFICATIONS',
      uptime: '99.9%',
      uptimeLabel: 'System Uptime',
      responseTime: '<1ms',
      responseTimeLabel: 'Response Time',
      processingPower: '∞',
      processingPowerLabel: 'Processing Power'
    },
    ctaButtonText: 'Access Full System'
  });

  // Save handlers
  const handleSave = (field) => (value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Save to localStorage
    const updatedContent = { ...content, [field]: value };
    localStorage.setItem('contentSectionContent', JSON.stringify(updatedContent));
  };

  const handleFeatureSave = (index, field) => (value) => {
    setContent(prev => {
      const newFeatures = [...prev.features];
      newFeatures[index] = { ...newFeatures[index], [field]: value };
      const updatedContent = { ...prev, features: newFeatures };
      
      // Save to localStorage
      localStorage.setItem('contentSectionContent', JSON.stringify(updatedContent));
      
      return updatedContent;
    });
  };

  const handleTechSpecSave = (field) => (value) => {
    setContent(prev => {
      const updatedContent = {
        ...prev,
        techSpecs: { ...prev.techSpecs, [field]: value }
      };
      
      // Save to localStorage
      localStorage.setItem('contentSectionContent', JSON.stringify(updatedContent));
      
      return updatedContent;
    });
  };

  // Load content from localStorage on component mount
  useEffect(() => {
    const savedContent = localStorage.getItem('contentSectionContent');
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        setContent(parsed);
      } catch (error) {
        console.error('Error loading saved content:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <SimpleEditableText
            value={content.sectionTitle}
            onSave={handleSave('sectionTitle')}
            displayClassName="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-6"
            editClassName="text-4xl md:text-6xl font-bold text-white bg-transparent border-2"
            placeholder="Enter section title..."
          />
          <SimpleEditableText
            value={content.sectionDescription}
            onSave={handleSave('sectionDescription')}
            displayClassName="text-xl text-gray-400 max-w-3xl mx-auto"
            editClassName="text-xl text-white bg-transparent"
            placeholder="Enter section description..."
            multiline={true}
          />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {content.features.map((feature, index) => (
            <div 
              key={index}
              className="glass rounded-xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group hover:scale-105"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-blue-400" />
                </div>
                <div className="flex-1">
                  <SimpleEditableText
                    value={feature.title}
                    onSave={handleFeatureSave(index, 'title')}
                    displayClassName="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300"
                    editClassName="text-xl font-semibold text-white bg-transparent border-2"
                    placeholder="Enter feature title..."
                  />
                  <SimpleEditableText
                    value={feature.description}
                    onSave={handleFeatureSave(index, 'description')}
                    displayClassName="text-gray-400 leading-relaxed"
                    editClassName="text-white bg-transparent"
                    placeholder="Enter feature description..."
                    multiline={true}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Specifications */}
        <div className="glass rounded-2xl p-8 border border-blue-500/20 mb-16">
          <SimpleEditableText
            value={content.techSpecs.title}
            onSave={handleTechSpecSave('title')}
            displayClassName="text-2xl font-bold text-blue-400 mb-6 text-center"
            editClassName="text-2xl font-bold text-white bg-transparent border-2"
            placeholder="Enter tech specs title..."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <SimpleEditableText
                value={content.techSpecs.uptime}
                onSave={handleTechSpecSave('uptime')}
                displayClassName="text-3xl font-bold text-cyan-400 mb-2"
                editClassName="text-3xl font-bold text-white bg-transparent border-2"
                placeholder="Enter uptime..."
              />
              <SimpleEditableText
                value={content.techSpecs.uptimeLabel}
                onSave={handleTechSpecSave('uptimeLabel')}
                displayClassName="text-gray-400 text-sm uppercase tracking-wide"
                editClassName="text-white bg-transparent"
                placeholder="Enter uptime label..."
              />
            </div>
            <div className="text-center">
              <SimpleEditableText
                value={content.techSpecs.responseTime}
                onSave={handleTechSpecSave('responseTime')}
                displayClassName="text-3xl font-bold text-green-400 mb-2"
                editClassName="text-3xl font-bold text-white bg-transparent border-2"
                placeholder="Enter response time..."
              />
              <SimpleEditableText
                value={content.techSpecs.responseTimeLabel}
                onSave={handleTechSpecSave('responseTimeLabel')}
                displayClassName="text-gray-400 text-sm uppercase tracking-wide"
                editClassName="text-white bg-transparent"
                placeholder="Enter response time label..."
              />
            </div>
            <div className="text-center">
              <SimpleEditableText
                value={content.techSpecs.processingPower}
                onSave={handleTechSpecSave('processingPower')}
                displayClassName="text-3xl font-bold text-purple-400 mb-2"
                editClassName="text-3xl font-bold text-white bg-transparent border-2"
                placeholder="Enter processing power..."
              />
              <SimpleEditableText
                value={content.techSpecs.processingPowerLabel}
                onSave={handleTechSpecSave('processingPowerLabel')}
                displayClassName="text-gray-400 text-sm uppercase tracking-wide"
                editClassName="text-white bg-transparent"
                placeholder="Enter processing power label..."
              />
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <SimpleEditableText
            value={content.ctaButtonText}
            onSave={handleSave('ctaButtonText')}
            displayClassName="group px-12 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 inline-flex items-center space-x-2"
            editClassName="px-12 py-4 text-white bg-transparent border-2"
            placeholder="Enter button text..."
          />
        </div>
      </div>
    </div>
  );
};

export default EditableContentSection;

