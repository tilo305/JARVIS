import { ArrowRight, Zap, Shield, Brain, Network } from 'lucide-react';

const ContentSection = () => {
  const features = [
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-6">
            SYSTEM CAPABILITIES
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience the next generation of AI-powered interface technology with advanced features 
            designed for optimal performance and seamless integration.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass rounded-xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group hover:scale-105"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Specifications */}
        <div className="glass rounded-2xl p-8 border border-blue-500/20 mb-16">
          <h3 className="text-2xl font-bold text-blue-400 mb-6 text-center">TECHNICAL SPECIFICATIONS</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">99.9%</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">System Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">&lt;1ms</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">∞</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Processing Power</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <button className="group px-12 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25">
            <span className="flex items-center space-x-2">
              <span>Access Full System</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentSection;

