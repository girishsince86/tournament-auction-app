'use client';

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen bg-background-primary p-8">
      {/* Test Colors */}
      <div className="space-y-4 mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Color Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-primary-500 text-white rounded-lg shadow-lg">
            Primary 500
          </div>
          <div className="p-6 bg-secondary-300 text-white rounded-lg shadow-lg">
            Secondary 300
          </div>
          <div className="p-6 bg-accent-500 text-white rounded-lg shadow-lg">
            Accent 500
          </div>
          <div className="p-6 bg-background-secondary text-text-primary rounded-lg shadow-lg">
            Background Secondary
          </div>
        </div>
      </div>

      {/* Test Typography */}
      <div className="space-y-6 mb-8 bg-background-secondary p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-text-primary">Typography Test</h2>
        <div className="space-y-4">
          <h1 className="font-heading text-4xl font-bold text-primary-500">
            Heading Font (Poppins)
          </h1>
          <p className="font-body text-lg text-text-secondary">
            Body Font (DM Sans) - Lorem ipsum dolor sit amet
          </p>
          <code className="font-mono bg-background-tertiary p-2 rounded text-accent-500">
            Mono Font (JetBrains Mono)
          </code>
        </div>
      </div>

      {/* Test Components */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Component Test</h2>
        <div className="space-y-4 bg-background-secondary p-6 rounded-lg">
          <input 
            type="text" 
            className="w-full p-3 bg-background-tertiary border border-text-tertiary/20 rounded-lg text-text-primary placeholder-text-tertiary/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200" 
            placeholder="Form Input Test"
          />
          <div className="flex space-x-4">
            <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg shadow-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200">
              Primary Button
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-secondary-300 to-secondary-400 text-white font-semibold rounded-lg shadow-lg hover:from-secondary-400 hover:to-secondary-500 transition-all duration-200">
              Secondary Button
            </button>
          </div>
        </div>
      </div>

      {/* Test Animations */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">Animation Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="animate-fadeIn p-6 bg-primary-100 text-primary-700 rounded-lg shadow-lg">
            Fade In Animation
          </div>
          <div className="animate-pulse p-6 bg-secondary-100 text-secondary-700 rounded-lg shadow-lg">
            Pulse Animation
          </div>
        </div>
      </div>
    </div>
  );
} 