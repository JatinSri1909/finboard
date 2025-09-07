'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  ChartLine, 
  Table2, 
  CreditCard, 
  TrendingUp, 
  Building2, 
  Globe,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Settings,
  Zap
} from 'lucide-react';
import { WIDGET_TEMPLATES, getTemplatesByProvider } from '@/constants/widget-templates';
import { WidgetTemplate, ApiProvider, WidgetConfig } from '@/types';
import { apiService } from '@/lib/api-service';
import { useWidgetStore } from '@/store';

interface WidgetTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

type WizardStep = 'provider' | 'template' | 'configure';

const API_PROVIDER_INFO = {
  'alpha-vantage': {
    name: 'Alpha Vantage',
    icon: Globe,
    description: 'Global financial data and market insights',
    color: 'bg-blue-500',
    features: ['Real-time quotes', 'Time series data', 'Market status'],
  },
  'finnhub': {
    name: 'Finnhub',
    icon: Building2,
    description: 'Real-time stock market data',
    color: 'bg-green-500',
    features: ['Company profiles', 'Price candles', 'Market data'],
  },
  'indian-api': {
    name: 'Indian Markets',
    icon: TrendingUp,
    description: 'Indian stock market data',
    color: 'bg-orange-500',
    features: ['Top gainers/losers', 'Market status', 'Free access'],
  },
};

const DISPLAY_MODE_ICONS = {
  card: CreditCard,
  table: Table2,
  chart: ChartLine,
};

export function WidgetTemplateSelector({ isOpen, onClose }: WidgetTemplateSelectorProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('provider');
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WidgetTemplate | null>(null);
  const [widgetName, setWidgetName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { addWidget } = useWidgetStore();

  // Reset wizard when modal opens/closes
  const handleClose = () => {
    setCurrentStep('provider');
    setSelectedProvider(null);
    setSelectedTemplate(null);
    setWidgetName('');
    setSymbol('');
    setIsCreating(false);
    onClose();
  };

  const filteredTemplates = selectedProvider 
    ? getTemplatesByProvider(selectedProvider)
    : [];

  const handleProviderSelect = (provider: ApiProvider) => {
    if (!apiService.isConfigured(provider)) return;
    setSelectedProvider(provider);
    setCurrentStep('template');
  };

  const handleTemplateSelect = (template: WidgetTemplate) => {
    setSelectedTemplate(template);
    setWidgetName(template.name);
    setCurrentStep('configure');
  };

  const handleBack = () => {
    if (currentStep === 'template') {
      setCurrentStep('provider');
      setSelectedProvider(null);
    } else if (currentStep === 'configure') {
      setCurrentStep('template');
      setSelectedTemplate(null);
      setWidgetName('');
      setSymbol('');
    }
  };

  const handleCreateWidget = async () => {
    if (!selectedTemplate || !widgetName.trim()) return;

    setIsCreating(true);
    
    try {
      // Test the API connection first
      const testResult = await apiService.testConnection(selectedTemplate.apiProvider);
      
      if (!testResult.success) {
        throw new Error(testResult.error || 'API connection failed');
      }

      const endpoints = apiService.getAvailableEndpoints(selectedTemplate.apiProvider);
      const defaultEndpoint = endpoints[0]; // Use first available endpoint as default

      // Check if endpoint requires symbol
      if (defaultEndpoint.requiresSymbol && !symbol.trim()) {
        throw new Error('Stock symbol is required for this widget');
      }

      const config: WidgetConfig = {
        id: `widget-${Date.now()}`,
        name: widgetName,
        apiUrl: '', // Keep for backward compatibility
        apiProvider: selectedTemplate.apiProvider,
        apiEndpoint: defaultEndpoint.value,
        symbol: symbol.trim() || undefined,
        refreshInterval: 30, // Default 30 seconds
        displayMode: selectedTemplate.displayMode,
        selectedFields: [],
        fields: testResult.fields || [],
        position: { x: 0, y: 0, width: 4, height: 3 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addWidget(config);
      onClose();
      
      // Reset form
      setSelectedTemplate(null);
      setWidgetName('');
      setSymbol('');
    } catch (error) {
      console.error('Failed to create widget:', error);
      alert(error instanceof Error ? error.message : 'Failed to create widget');
    } finally {
      setIsCreating(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'provider':
        return 'Choose API Provider';
      case 'template':
        return 'Select Widget Template';
      case 'configure':
        return 'Configure Widget';
      default:
        return 'Create New Widget';
    }
  };

  const renderProviderStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Choose Your Data Provider</h3>
        <p className="text-slate-300 text-lg max-w-md mx-auto">Select which financial API you'd like to use for your widget</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {Object.entries(API_PROVIDER_INFO).map(([provider, info]) => {
          const IconComponent = info.icon;
          const isConfigured = apiService.isConfigured(provider as ApiProvider);
          
          return (
            <Card
              key={provider}
              className={`group relative cursor-pointer transition-all duration-300 border-2 ${
                isConfigured 
                  ? 'border-slate-600 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 bg-gradient-to-br from-slate-800 to-slate-900' 
                  : 'border-slate-700 bg-slate-800/50 opacity-75'
              } ${isConfigured ? 'hover:scale-105' : ''}`}
              onClick={() => isConfigured && handleProviderSelect(provider as ApiProvider)}
            >
              {/* Status indicator */}
              <div className="absolute -top-2 -right-2 z-10">
                {isConfigured ? (
                  <div className="bg-green-500 rounded-full p-1">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="bg-red-500 rounded-full p-1">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <CardHeader className="text-center pb-4 relative">
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-4 rounded-2xl ${info.color} shadow-lg`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {info.name}
                </CardTitle>
                <p className="text-slate-300 text-sm leading-relaxed">{info.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0 pb-6">
                <div className="space-y-3">
                  {info.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-200">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {!isConfigured && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-lg border border-red-500/40">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <p className="text-sm text-red-300 font-medium">API key required</p>
                    </div>
                  </div>
                )}

                {isConfigured && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg border border-green-500/40">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <p className="text-sm text-green-300 font-medium">Ready to use</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderTemplateStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Select Widget Template</h3>
        <p className="text-slate-300 text-lg max-w-lg mx-auto">
          Choose from <span className="text-blue-400 font-semibold">{selectedProvider && API_PROVIDER_INFO[selectedProvider].name}</span> widget templates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {filteredTemplates.map((template) => {
          const IconComponent = DISPLAY_MODE_ICONS[template.displayMode];
          
          return (
            <Card
              key={template.id}
              className="group cursor-pointer transition-all duration-300 border-2 border-slate-600 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/20 bg-gradient-to-br from-slate-800 to-slate-900 hover:scale-105"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                        {template.name}
                      </CardTitle>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="text-xs capitalize bg-slate-700 border-slate-600 text-slate-200"
                  >
                    {template.displayMode}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-6">
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  {template.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className="text-xs capitalize bg-blue-500/20 border-blue-500/40 text-blue-300"
                  >
                    {template.category.replace('-', ' ')}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderConfigureStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Configure Your Widget</h3>
        <p className="text-slate-300 text-lg max-w-lg mx-auto">Set up your widget with a name and any required parameters</p>
      </div>

      {selectedTemplate && (
        <div className="max-w-lg mx-auto space-y-8">
          {/* Template Preview */}
          <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-slate-600 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${API_PROVIDER_INFO[selectedTemplate.apiProvider].color} shadow-lg`}>
                  {(() => {
                    const IconComponent = DISPLAY_MODE_ICONS[selectedTemplate.displayMode];
                    return <IconComponent className="w-6 h-6 text-white" />;
                  })()}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedTemplate.name}</h4>
                  <p className="text-sm text-slate-300">{selectedTemplate.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${API_PROVIDER_INFO[selectedTemplate.apiProvider].color} text-white border-0`}>
                {API_PROVIDER_INFO[selectedTemplate.apiProvider].name}
              </Badge>
              <Badge variant="outline" className="bg-slate-700 border-slate-600 text-slate-200">
                {selectedTemplate.displayMode}
              </Badge>
              <Badge variant="outline" className="bg-blue-500/20 border-blue-500/40 text-blue-300">
                {selectedTemplate.category.replace('-', ' ')}
              </Badge>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="widget-name" className="text-base font-semibold text-white flex items-center gap-2">
                Widget Name
                <span className="text-red-400">*</span>
              </Label>
              <Input
                id="widget-name"
                value={widgetName}
                onChange={(e) => setWidgetName(e.target.value)}
                placeholder="Enter a descriptive name for your widget"
                className="h-12 bg-slate-800 border-2 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol" className="text-base font-semibold text-white flex items-center gap-2">
                Stock Symbol
                <span className="text-slate-400 text-sm font-normal">(Optional)</span>
              </Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL, TSLA, GOOGL"
                className="h-12 bg-slate-800 border-2 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20"
              />
              <div className="flex items-start gap-2 mt-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-slate-400">
                  Required for stock-specific data like quotes, charts, and company profiles
                </p>
              </div>
            </div>

            {/* Quick Symbol Suggestions */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-300">Popular symbols:</p>
              <div className="flex flex-wrap gap-2">
                {['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'].map((symbolSuggestion) => (
                  <button
                    key={symbolSuggestion}
                    onClick={() => setSymbol(symbolSuggestion)}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-sm text-slate-200 transition-colors"
                  >
                    {symbolSuggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-900 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { key: 'provider', label: 'Provider', icon: Globe },
            { key: 'template', label: 'Template', icon: Settings },
            { key: 'configure', label: 'Configure', icon: CreditCard }
          ].map((step, index) => {
            const isActive = currentStep === step.key;
            const isCompleted = index < ['provider', 'template', 'configure'].indexOf(currentStep);
            const IconComponent = step.icon;
            
            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                        : isCompleted
                        ? 'bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-lg shadow-green-500/30'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <IconComponent className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-xs font-medium mt-2 transition-colors ${
                    isActive || isCompleted ? 'text-white' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`w-16 h-0.5 mx-4 mt-[-16px] transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 'provider' && renderProviderStep()}
          {currentStep === 'template' && renderTemplateStep()}
          {currentStep === 'configure' && renderConfigureStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-slate-700/50">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 'provider'}
            className={`h-12 px-6 border-2 transition-all duration-200 ${
              currentStep === 'provider' 
                ? 'border-slate-700 text-slate-500 cursor-not-allowed' 
                : 'border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500'
            }`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-4">
            {currentStep !== 'configure' && (
              <div className="text-sm text-slate-400">
                Step {['provider', 'template', 'configure'].indexOf(currentStep) + 1} of 3
              </div>
            )}
            
            {currentStep === 'configure' && (
              <Button
                onClick={handleCreateWidget}
                disabled={!widgetName.trim() || isCreating}
                className={`h-12 px-8 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white border-0 shadow-lg transition-all duration-200 ${
                  !widgetName.trim() || isCreating 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-xl hover:shadow-green-500/25 hover:scale-105'
                }`}
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Widget
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
